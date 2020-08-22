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
// todo import kotlin.js.Promise :(

fun log(msg: String) {
    Log.d("MissedThePlane", msg)
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
        webView.addJavascriptInterface(JavaScriptInterface(this, webView), "Android")
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

    class JavaScriptInterface internal constructor(val context: Context, val webView: WebView) {
        /** Show a toast from the web page  */
        @JavascriptInterface
        fun showToast(toast: String?) {
            Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun getVersion(): String {
            return context.packageManager.getPackageInfo(context.packageName, 0).versionName
        }

        @JavascriptInterface
        fun returnPromise() {

        }


        /** Updates this user highest reached level in the campaign
         *  Checks if the user isn't on a higher level already, and if we even have a highest level field already */
        @JavascriptInterface
        fun setHighestLevel(userId: String, campaignIndex: Int) {
            GlobalScope.launch {
                val userData = getDocument("users", userId) ?: return@launch
                if (userData["highestLevel"] == null || campaignIndex > (userData["highestLevel"] as Long).toInt())
                    updateDocument("users", userId, hashMapOf("highestLevel" to campaignIndex))
            }
        }

        /** Publishes one of the levels the user currently has saved locally */
        @JavascriptInterface
        fun publishLevel(userId: String, levelSlot: String, levelString: String, levelName: String): Boolean {
            // TODO: check if the user doesn't have more than x published levels total?
            GlobalScope.launch {
                var levelId = getLevelId(userId, levelSlot)
                val levelData = getLevelData(levelId)
                if (levelId == null || levelData == null || levelData["levelString"] != levelString) { // A user is publishing a newer version from his level than he currently has saved in the db
                    addError("User $userId tried publishing a level which doesn't correspond to his saved level $levelId")
                    levelId = createLevel(userId, levelSlot, levelString) // We create a new level and overwrite it on the slot the user published it on
                }
                updateDocument("levels", levelId, hashMapOf("public" to true,
                                                                     "submitDate" to FieldValue.serverTimestamp(),
                                                                     "name" to levelName))
            }
            return true // TODO - in case publishing can fail (max levels reached or whatever), find a way to notify js
        }

        /** Updates a given level in a certain user slot, and if it doesn't exist yet, create it */
        @JavascriptInterface
        fun updateLevel(userId: String, levelSlot: String, levelString: String) {
            GlobalScope.launch {
                var levelId = getLevelId(userId, levelSlot)
                if (levelId == null) {
                    // The user doesn't have a level id linked to this slot, we assume he simply made a new level
                    levelId = createLevel(userId, levelSlot, levelString)
                }
                //TODO do we want to check if level isn't published already? extra safety but an extra read every update
                val newData = hashMapOf("levelString" to levelString,
                                        "lastUpdate" to FieldValue.serverTimestamp())
                updateDocument("levels", levelId, newData)
            }
        }

        /** 'Deletes' a level in the database (marks it deleted), as well as freeing the spot in the user document */
        @JavascriptInterface
        fun deleteLevel(userId: String, levelSlot: String) {
            GlobalScope.launch {
                val levelId = getLevelId(userId, levelSlot)
                val levelData = getLevelData(levelId)
                if (levelId == null || levelData == null || levelData["deleted"] as Boolean) return@launch
                updateSlot(userId, levelSlot, null)
                updateDocument("levels", levelId, hashMapOf("deleted" to true, "public" to false))
            }
        }

        /** Returns a list of dictionaries, each representing a level object (attributes like levelString, plays, rating, etc) */
        @JavascriptInterface
        fun getPublishedLevels() {
            val citiesRef = Firebase.firestore.collection("levels")
            val query = citiesRef.whereEqualTo("public", true)
            query.get().addOnSuccessListener { documents ->
                val onlyData: MutableList<String> = ArrayList()
                for (document in documents) {
                    document.data["id"] = document.id
                    onlyData.add(convertToJSONString(document.data))
                }
                webView.loadUrl("javascript:receivePublicLevels('$onlyData')");
            }
        }

        /** Converts a kotlin map to a JSON parsable string */
        fun convertToJSONString(kotlinMap: Map<String, Any>): String {
            var jsonString = "{"
            for ((key, value) in kotlinMap) {
                if (value is Boolean) {
                    jsonString += "\"$key\": $value, "
                } else if (value is String) {
                    jsonString += "\"$key\": \"$value\", "
                }
            }
            jsonString = jsonString.dropLast(2)
            jsonString += "}"
            return jsonString
        }

        /** Keeps track of which user has played (and cleared) which levels already, and updates the values for
         *  that level as well. */
        fun playLevel(userId: String, levelId: String, cleared: Boolean) {
            GlobalScope.launch {
                val actualId = userId+levelId // yeah...
                val playerStatus = getDocument("userPlays", actualId)
                if (playerStatus == null) { // The player never played this before
                    val newRelation = hashMapOf("cleared" to cleared, "upvote" to null)
                    addNewDocument("userPlays", newRelation, actualId)
                    if (!cleared) {
                        updateDocument("levels", levelId, hashMapOf("plays" to FieldValue.increment(1)))
                    } else { // The player never played this level before, but cleared it now...
                        addError("User $userId cleared level $levelId without ever playing it!")
                        updateDocument("levels", levelId, hashMapOf("plays" to FieldValue.increment(1),
                            "clears" to FieldValue.increment(1)))
                    }
                }
                else if (cleared) { // The player has played before, and now finished the level
                    if (!(playerStatus["cleared"] as Boolean)) { // He didn't clear it before, we update clear counter
                        updateDocument("levels", levelId, hashMapOf("clears" to FieldValue.increment(1)))
                        updateDocument("userPlays", actualId, hashMapOf("cleared" to true))
                    } // If the user did clear it already, we don't need to change anything
                }
                else { // The player played this level previously, now starts again
                    // No need to do anything
                }
            }
        }

        fun voteForLevel(userId: String, levelId: String, upvote: Boolean) {
            GlobalScope.launch {
                val actualId = userId + levelId // yeah...
                val playerStatus = getDocument("userPlays", actualId)
                if (playerStatus == null) {
                    addError("User $userId tried to vote on $levelId without ever playing it!"); return@launch
                }
                if (playerStatus["upvote"] == null) { // The user didn't vote before on this level
                    updateDocument("userPlays", actualId, hashMapOf("upvote" to upvote))
                    if (upvote) updateDocument("levels", levelId, hashMapOf("upvotes" to FieldValue.increment(1)))
                    else updateDocument("levels", levelId, hashMapOf("downvotes" to FieldValue.increment(1)))
                } else if (playerStatus["upvote"] as Boolean && !upvote) { // The user wants to change upvote to downvote
                    updateDocument("userPlays", actualId, hashMapOf("upvote" to false))
                    updateDocument("levels", levelId, hashMapOf("upvotes" to FieldValue.increment(-1),
                                                                         "downvotes" to FieldValue.increment(1)))
                } else if (!(playerStatus["upvote"] as Boolean) && upvote) { // The user wants to change downvote to upvote
                    updateDocument("userPlays", actualId, hashMapOf("upvote" to true))
                    updateDocument("levels", levelId, hashMapOf("upvotes" to FieldValue.increment(1),
                                                                         "downvotes" to FieldValue.increment(-1)))
                }
            }
        }

        /** Adds an error to the database, so we can see if something is broken */
        suspend fun addError(error: String) {
            val newError = hashMapOf("error" to error,
                "errorDate" to FieldValue.serverTimestamp())
            addNewDocument("errors", newError)
        }

        // TODO: move all 'backend functions' which js does not need to know about to other class/file
        // Useful for later: `"timestamp" to FieldValue.serverTimestamp()` in a hashmap automatically sets timestamp
        //                   `washingtonRef.update("population", FieldValue.increment(50))` increments given value

        /** Adds a new document to a given collection and returns its automatically generated id if none was given. */
        suspend fun addNewDocument(collection: String, data: HashMap<String, *>, customId: String? = null): String {
            if (customId == null) return Firebase.firestore.collection(collection).add(data).await().id
            Firebase.firestore.collection(collection).document(customId).set(data).await()
            return customId
        }

        fun updateDocument(collection: String, document: String, newData: HashMap<String, *>) {
            val db = Firebase.firestore
            db.collection(collection).document(document).update(newData)
                .addOnSuccessListener { Log.d("TAG", "DocumentSnapshot successfully updated!") }
                .addOnFailureListener { e -> Log.w("TAG", "Error updating document", e) }
        }

        /** Generates a new level as well as adding a reference to it to the user array
         *  Returns the id of the newly created level */
        suspend fun createLevel(userId: String, levelSlot: String, levelString: String): String {
            val newLevel = hashMapOf(
                "author" to userId,
                "levelString" to levelString,
                "lastUpdate" to FieldValue.serverTimestamp(),
                "submitDate" to null,
                "public" to false,
                "deleted" to false,
                "plays" to 0,
                "clears" to 0,
                "upvotes" to 0,
                "downvotes" to 0,
                "name" to "Private level"
            )
            val levelId = addNewDocument("levels", newLevel)
            updateSlot(userId, levelSlot, levelId)
            return levelId
        }

        /** Replaces a level slot in the user object with the new id (or removes it, if the new id is null) */
        suspend fun updateSlot(userId: String, levelSlot: String, newLevelId: String?) {
            val userData = getDocument("users", userId)
            if (userData == null || userData["levels"] == null) {addError("User $userId does not have a level map!"); return}
            val levelDict = userData["levels"] as MutableMap<String, String>
            if (newLevelId == null) levelDict.remove(levelSlot) // levelId is null, we want to remove this level from the user array
            else levelDict[levelSlot] = newLevelId
            updateDocument("users", userId, hashMapOf("levels" to levelDict))
        }

        suspend fun getLevelData(levelId: String?): MutableMap<String, Any>? {
            if (levelId == null) return null
            val levelData = getDocument("levels", levelId)
            if (levelData == null) addError("Request was made to fetch level $levelId but it could not be found!")
            return levelData
        }

        suspend fun getLevelId(userId: String, levelSlot: String): String? {
            val userData = getDocument("users", userId)
            if (userData == null || userData["levels"] == null) return null // TODO maybe: add error if the user couldn't be found?
            val levelDict = userData["levels"] as Map<String, String>
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