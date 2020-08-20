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

        /** Updates this user highest reached level in the campaign
         *  Checks if the user isn't on a higher level already, and if we even have a highest level field already */
        @JavascriptInterface
        fun setHighestLevel(userId: String, campaignIndex: Int) {
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
        fun publishLevel(userId: String, levelIndex: Int, levelString: String) {
            // levelIndex could be used to verify?
            val newLevel = hashMapOf("author" to userId,
                                     "levelString" to levelString,
                                     "submitDate" to FieldValue.serverTimestamp(),
                                     "public" to true,
                                     "plays" to 0,
                                     "clears" to 0)
            addNewDocument("levels", newLevel)
        }

        /** Updates a given level in a certain user slot */
        @JavascriptInterface
        fun updateLevel(userId: String, levelSlot: Int, levelString: String) {
            val db = Firebase.firestore // Welcome to boilerplate restaurant, may I take your order
            db.collection("users").document(userId).get().addOnSuccessListener { userResult ->
                val resultData = userResult.data
                if (userResult != null && resultData != null && resultData["levels"] != null && (resultData["levels"] as Map<Int, String>)[levelSlot] != null) {
                    val levelDict = resultData["levels"] as MutableMap<Int, String>
                    val levelId = levelDict[levelSlot]
                    if (levelId != null) {
                        db.collection("levels").document(levelId).get().addOnSuccessListener { levelResult ->
                            val levelData = levelResult.data
                            if (levelResult == null || levelData == null) {
                                addError("User $userId tried updating level slot $levelSlot which gave levelId $levelId but it wasn't found in the level table.")
                            } else {  // Here starts the actual body of this function
                                if (levelData["public"] == true) {
                                    addError("User $userId tried updating levelId $levelId but it is published already! Making new level and replacing user slot (very bad).")
                                    // TODO: here a new level should be created, and use its id to update the user dict, but this is just too much
                                } else {
                                    updateDocument("levels", levelId, hashMapOf("levelString" to levelString))
                                }
                            }
                        }
                    } else {
                        addError("User $userId tried updating level slot $levelSlot but there was no levelId found in his user document for that slot.")
                    }
                }
            }
        }

        /** 'Deletes' a level in the database (marks it deleted), as well as freeing the spot in the user document */
        @JavascriptInterface
        fun deleteLevel(userId: String, levelSlot: Int) {
            val db = Firebase.firestore // Welcome to boilerplate restaurant, may I take your order
            db.collection("users").document(userId).get().addOnSuccessListener { userResult ->
                val resultData = userResult.data
                if (userResult != null && resultData != null && resultData["levels"] != null && (resultData["levels"] as Map<Int, String>)[levelSlot] != null) {
                    val levelDict = resultData["levels"] as MutableMap<Int, String>
                    val levelId = levelDict[levelSlot]
                    if (levelId != null) {
                        db.collection("levels").document(levelId).get().addOnSuccessListener { levelResult ->
                            val levelData = levelResult.data
                            if (levelResult == null || levelData == null) {
                                addError("User $userId tried deleting level slot $levelSlot which gave levelId $levelId but it wasn't found in the level table.")
                            } else {  // Here starts the actual body of this function
                                updateDocument("levels", levelId, hashMapOf("public" to false, "deleted" to true))
                                levelDict.remove(levelSlot)
                                updateDocument("users", userId, hashMapOf("levels" to levelDict))
                            }
                        }
                    } else {
                        addError("User $userId tried deleting level slot $levelSlot but there was no levelId found in his user document for that slot.")
                    }
                }
            }
        }

        /** Generates a new level as well as adding a reference to it to the user array */
        @JavascriptInterface
        fun createNewLevel(userId: String, levelSlot: Int, levelString: String) {
            val db = Firebase.firestore
            db.collection("users").document(userId).get().addOnSuccessListener { result ->
                val resultData = result.data
                if (result != null && resultData != null && resultData["levels"] != null && (resultData["levels"] as Map<Int, String>)[levelSlot] != null) {
                    val levelId = (resultData["levels"] as Map<Int, String>)[levelSlot]
                    // Now we have the levelId, we can finally start
                }
            }
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
            val db = Firebase.firestore
            db.collection(collection).document(document).update(newData)
                .addOnSuccessListener { Log.d("TAG", "DocumentSnapshot successfully updated!") }
                .addOnFailureListener { e -> Log.w("TAG", "Error updating document", e) }
        }

        fun getCollection(collection: String) {
            val db = Firebase.firestore
            db.collection(collection).get()
                .addOnSuccessListener { result ->
                    for (document in result) {
                        Log.d("TAG", "${document.id} => ${document.data}")
                    }
                }
                .addOnFailureListener { exception ->
                    Log.w("TAG", "Error getting documents.", exception)
                }
        }

        fun getDocument(collection: String, document: String) {
            val db = Firebase.firestore
            val docRef = db.collection(collection).document(document)
            docRef.get().addOnSuccessListener { result ->
                if (result != null) {
                    Log.d("TAG", "DocumentSnapshot data: ${result.data}")
                } else {
                    Log.d("TAG", "No such document")
                }
            }
                .addOnFailureListener { exception ->
                    Log.d("TAG", "get failed with ", exception)
                }
        }
    }
}