package com.missedtheplane

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.*
import kotlin.collections.HashMap


fun log(msg: String) {
    Log.e("MissedThePlane", msg)
}

class MainActivity : AppCompatActivity() {
    @SuppressLint("ClickableViewAccessibility", "SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_fullscreen)

        // Set up WebView
        val webView = findViewById<WebView>(R.id.game_view)
        webView.settings.javaScriptEnabled = true
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.allowFileAccessFromFileURLs = true
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.addJavascriptInterface(JavaScriptInterface(this), "Android")
        webView.loadUrl("file:///android_asset/index.html")
    }

    override fun onStart() {
        super.onStart()
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_LOW_PROFILE or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
    }

    class JavaScriptInterface internal constructor(val context: Context) {
        /** Show a toast from the web page  */
        @JavascriptInterface
        fun showToast(toast: String?) {
            Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun getVersion(): String {
            return context.packageManager.getPackageInfo(context.packageName, 0).versionName
        }

        /** Updates this user highest reached level in the campaign
         *  Checks if the user isn't on a higher level already, and if we even have a highest level field already */
        @JavascriptInterface
        fun setHighestLevel(userId: String, campaignIndex: Int) {
            // TODO with new method
            val db = Firebase.firestore
            db.collection("users").document(userId).get().addOnSuccessListener { result ->
                val resultData = result.data
                if (result != null && resultData != null &&
                    (resultData["highestLevel"] == null || campaignIndex > (resultData["highestLevel"] as Long).toInt())) {
                        updateDocument("users", userId, hashMapOf("highestLevel" to campaignIndex))
                }
            }
        }

        /** Publishes one of the levels the user currently has saved locally */
        @JavascriptInterface
        fun publishLevel(userId: String, levelSlot: String, levelString: String) {
            // levelIndex could be used to verify?
        }

        /** Updates a given level in a certain user slot */
        @JavascriptInterface
        fun updateLevel(userId: String, levelSlot: String, levelString: String) {

        }

        /** 'Deletes' a level in the database (marks it deleted), as well as freeing the spot in the user document */
        @JavascriptInterface
        fun deleteLevel(userId: String, levelSlot: String) {
            GlobalScope.launch {
                val levelId = getLevelId(userId, levelSlot)
                val levelData = getLevelData(levelId)
                log("level id is $levelId, levelData is $levelData")
                if (levelId == null || levelData == null || levelData["deleted"] as Boolean) return@launch
                updateSlot(userId, levelSlot, null)
                updateDocument("levels", levelId, hashMapOf("deleted" to true, "public" to false))
            }
        }

        /** Generates a new level as well as adding a reference to it to the user array */
        @JavascriptInterface
        fun createNewLevel(userId: String, levelSlot: String, levelString: String) {
            val newLevel = hashMapOf("author" to userId,
                "levelString" to levelString,
                "submitDate" to FieldValue.serverTimestamp(),
                "public" to true,
                "plays" to 0,
                "clears" to 0)
        }

        /** Returns a list of dictionaries, each representing a level object (attributes like levelString, plays, rating, etc) */
        @JavascriptInterface
        fun getPublishedLevels() {

        }

        /** Adds an error to the database, so we can see if something is broken */
        fun addError(error: String) {
            val newError = hashMapOf("error" to error,
                "errorDate" to FieldValue.serverTimestamp())
            addNewDocument("errors", newError)
        }

        // All TODO's here since they seem to get everywhere:
        // TODO: move all 'backend functions' which js does not need to know about to other class/file
        // TODO: extract each 'val db' to a place where it can be reused
        // TODO: listeners should be able to return their outcome to the callers
        // Useful for later: `"timestamp" to FieldValue.serverTimestamp()` in a hashmap automatically sets timestamp
        //                   `washingtonRef.update("population", FieldValue.increment(50))` increments given value

        fun addNewDocument(collection: String, data: HashMap<String, *>) {
            val db = Firebase.firestore

            db.collection(collection).add(data).addOnSuccessListener { documentReference ->
                Log.d("TAG", "DocumentSnapshot written with ID: ${documentReference.id}")
            }
        }

        fun updateDocument(collection: String, document: String, newData: HashMap<String, *>) {
            log("updating document $document in collection $collection")
            val db = Firebase.firestore
            db.collection(collection).document(document).update(newData)
                .addOnSuccessListener { Log.d("TAG", "DocumentSnapshot successfully updated!") }
                .addOnFailureListener { e -> Log.w("TAG", "Error updating document", e) }
        }

        /** Replaces a level slot in the user object with the new id (or removes it, if the new id is null) */
        suspend fun updateSlot(userId: String, levelSlot: String, newLevelId: String?) {
            log("updating slot $levelSlot, with newLevelId $newLevelId")
            val userData = getDocument("users", userId)
            if (userData == null || userData["levels"] == null) return // TODO maybe: add error if the user couldn't be found?
            val levelDict = userData["levels"] as MutableMap<String, String>
            if (newLevelId == null) levelDict.remove(levelSlot) // We want to remove this level from the user array
            else levelDict[levelSlot] = newLevelId
            updateDocument("users", userId, hashMapOf("levels" to levelDict))
        }

        suspend fun getLevelData(levelId: String?): MutableMap<String, Any>? {
            log("getting level data for $levelId")
            if (levelId == null) return null
            val levelData = getDocument("levels", levelId)
            if (levelData == null) addError("Request was made to fetch level $levelId but it could not be found!")
            return levelData
        }

        suspend fun getLevelId(userId: String, levelSlot: String): String? {
            val userData = getDocument("users", userId)
            if (userData == null || userData["levels"] == null) return null // TODO maybe: add error if the user couldn't be found?
            val levelDict = userData["levels"] as Map<String, String>
            log("dict $levelDict with slot is ${levelDict[levelSlot]}")
            if (levelDict[levelSlot] == null) addError("Did not find levelId at slot $levelSlot for user $userId")
            return levelDict[levelSlot]
        }

        suspend fun getDocument(collection: String, documentId: String): MutableMap<String, Any>? {
            return try {
                    Firebase.firestore.collection(collection).document(documentId).get().await().data
                } catch (e : Exception) {
                    log("exception when getting! $e")
                    null
                }
        }
    }
}