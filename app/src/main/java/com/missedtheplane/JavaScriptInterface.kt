package com.missedtheplane

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

private const val KEY_SHARED_PREFS = "missedtheplane"
private const val KEY_USER_ID = "userid"
private const val KEY_LOCAL_LEVEL = "locallevel"
private const val KEY_SOLVABLE = "solvable"
private const val KEY_AUTHOR = "authorname"
private const val KEY_PUBLISHED = "published"
private const val DEFAULT_LEVEL_STRING = "{\"size\":4,\"tiles\":[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],\"pilot\":[3.5,0.5,1],\"plane\":[4.5,0.5,1],\"difficulty\":\"0\"}"

class JavaScriptInterface internal constructor(private val context: Context, private val webView: WebView) {
    val prefs = context.getSharedPreferences(KEY_SHARED_PREFS, 0)
    val editor = prefs.edit()

    // TODO INLINE?
    fun getUserId() = prefs.getString(KEY_USER_ID, null)
    fun setUserId(id: String) {
        editor.putString(KEY_USER_ID, id)
        editor.apply()
    }

    /** Show a toast from the web page  */
    @JavascriptInterface
    fun showToast(toast: String) {
        Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        log(toast)
    }

    @JavascriptInterface
    fun getVersion(): String {
        return context.packageManager.getPackageInfo(context.packageName, 0).versionName
    }

    @JavascriptInterface
    fun getLocalLevel(index: String): String {
        return prefs.getString(KEY_LOCAL_LEVEL + index, DEFAULT_LEVEL_STRING)!!
    }

    @JavascriptInterface
    fun setLocalLevel(index: String, levelString: String) {
        editor.putString(KEY_LOCAL_LEVEL + index,levelString)
        editor.apply()
    }

    @JavascriptInterface
    fun getSolvable(index: String): Boolean {
        return prefs.getBoolean(KEY_SOLVABLE + index, false)
    }

    @JavascriptInterface
    fun setSolvable(index: String, isSolvable: Boolean) {
        editor.putBoolean(KEY_SOLVABLE + index, isSolvable)
        editor.apply()
    }

    @JavascriptInterface
    fun getAuthorName(): String {
        return prefs.getString(KEY_AUTHOR, "")!!
    }

    @JavascriptInterface
    fun setAuthorName(newName: String) {
        editor.putString(KEY_AUTHOR, newName)
        editor.apply()
        updateDocument("users", getUserId(), hashMapOf("name" to newName))
    }

    @JavascriptInterface
    fun getPublished(index: String): Boolean {
        return prefs.getBoolean(KEY_PUBLISHED + index, false)
    }

    @JavascriptInterface
    fun setPublished(index: String, isPublished: Boolean) {
        editor.putBoolean(KEY_PUBLISHED + index, isPublished)
        editor.apply()
    }

    /** If there isn't a user id saved locally yet, this function will
     * create a new user in the database and saves the automatically generated id to shared prefs */
    @JavascriptInterface
    fun getNewUserIdIfNeeded() {
        GlobalScope.launch {
            if (getUserId() != null) return@launch
            log("No user id found, creating a new one in the database.")
            val newUserData = hashMapOf("highestLevel" to -1, "levels" to emptyMap<Int, String>(), "name" to null)
            val newUserId = addNewDocument("users", newUserData)
            setUserId(newUserId)
        }
    }

    /** Updates this user highest reached level in the campaign
     *  Checks if the user isn't on a higher level already, and if we even have a highest level field already */
    @JavascriptInterface
    fun setHighestLevel(campaignIndex: Int) {
        GlobalScope.launch {
            val userId = getUserId()
            val userData = getDocument("users", userId) ?: return@launch
            if (userData["highestLevel"] == null || campaignIndex > (userData["highestLevel"] as Long).toInt())
                updateDocument("users", userId, hashMapOf("highestLevel" to campaignIndex))
        }
    }

    /** Publishes one of the levels the user currently has saved locally */
    @JavascriptInterface
    fun publishLevel(levelSlot: String, levelString: String, levelName: String): Boolean {
        // TODO: check if the user doesn't have more than x published levels total?
        // TODO send errors to js as well as soon as it works
        val userId = getUserId()
        GlobalScope.launch {
            var levelId = getLevelId(levelSlot)
            val levelData = getLevelData(levelId)
            if (getAuthorName() == "") {addError("User $userId tried publishing without having author name!"); return@launch}
            if (levelId == null || levelData == null || levelData["levelString"] != levelString) { // A user is publishing a newer (?) version from his level than he currently has saved in the db
                addError("User $userId published a level which doesn't correspond to his saved level $levelId!!")
                levelId = createLevel(levelSlot, levelString) // We create a new level and overwrite it on the slot the user published it on
            }
            updateDocument("levels", levelId, hashMapOf(
                    "public" to true,
                    "submitDate" to FieldValue.serverTimestamp(),
                    "name" to levelName,
                    "authorName" to getAuthorName()
                )
            )
            sendToJs("receivePublishResponse", "{\"success\": true}")
        }
        return true
    }

    /** Updates a given level in a certain user slot, and if it doesn't exist yet, create it */
    @JavascriptInterface
    fun updateLevel(levelSlot: String, levelString: String) {
        GlobalScope.launch {
            var levelId: String? = ""
            if (slotExists(levelSlot)) levelId = getLevelId(levelSlot)
            else levelId = createLevel(levelSlot, levelString)  // The user doesn't have a level id linked to this slot, we assume he simply made a new level
            val newData = hashMapOf(
                "levelString" to levelString,
                "lastUpdate" to FieldValue.serverTimestamp()
            )
            updateDocument("levels", levelId, newData)
        }
    }

    /** 'Deletes' a level in the database (marks it deleted), as well as freeing the spot in the user document */
    @JavascriptInterface
    fun deleteLevel(levelSlot: String) {
        GlobalScope.launch {
            val levelId = getLevelId(levelSlot)
            val levelData = getLevelData(levelId)
            if (levelId == null || levelData == null || levelData["deleted"] as Boolean) return@launch
            updateSlot(levelSlot, null)
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
                val dataToParse = document.data.toMutableMap()
                dataToParse["id"] = document.id
                onlyData.add(convertToJSONString(dataToParse))
            }
            log(onlyData.toString())
            val urlData = "\'" + onlyData.toString() + "\'"
            log(urlData)
            webView.loadUrl("javascript:receivePublicLevels($urlData)");
        }
    }

    /** Converts a kotlin map to a JSON parsable string */
    fun convertToJSONString(kotlinMap: Map<String, Any>): String {
        var jsonString = "{"
        for ((key, value) in kotlinMap) {
            if (value is String) {
                if (key == "levelString") jsonString += "\"$key\": \"${value.replace("\"", "\\\\\"")}\", "
                else jsonString += "\"$key\": \"$value\", "
            } else if (value is Timestamp) {
                jsonString += "\"$key\": ${value.seconds}, "
            } else {
                jsonString += "\"$key\": $value, "
            }
        }
        jsonString = jsonString.dropLast(2)
        jsonString += "}"
        return jsonString
    }

    /** Keeps track of which user has played (and cleared) which levels already, and updates the values for
     *  that level as well. */
    @JavascriptInterface
    fun playLevel(levelId: String, cleared: Boolean) {
        val userId = getUserId()
        GlobalScope.launch {
            val actualId = userId + levelId // yeah...
            val playerStatus = getDocument("userPlays", actualId)
            if (playerStatus == null) { // The player never played this before
                val newRelation = hashMapOf("cleared" to cleared, "upvote" to null)
                addNewDocument("userPlays", newRelation, actualId)
                if (!cleared) {
                    updateDocument("levels", levelId, hashMapOf("plays" to FieldValue.increment(1)))
                } else { // The player never played this level before, but cleared it now...
                    addError("User $userId cleared level $levelId without ever playing it!")
                    updateDocument("levels", levelId, hashMapOf(
                            "plays" to FieldValue.increment(1),
                            "clears" to FieldValue.increment(1)
                        )
                    )
                }
            } else if (cleared) { // The player has played before, and now finished the level
                if (!(playerStatus["cleared"] as Boolean)) { // He didn't clear it before, we update clear counter
                    updateDocument(
                        "levels",
                        levelId,
                        hashMapOf("clears" to FieldValue.increment(1))
                    )
                    updateDocument("userPlays", actualId, hashMapOf("cleared" to true))
                } // If the user did clear it already, we don't need to change anything
            } else { // The player played this level previously, now starts again
                // No need to do anything
            }
        }
    }

    @JavascriptInterface
    fun voteForLevel(levelId: String, upvote: Boolean) {
        val userId = getUserId()
        log("received vote: $upvote")
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
                updateDocument("levels", levelId, hashMapOf("upvotes" to FieldValue.increment(-1),"downvotes" to FieldValue.increment(1)))
            } else if (!(playerStatus["upvote"] as Boolean) && upvote) { // The user wants to change downvote to upvote
                updateDocument("userPlays", actualId, hashMapOf("upvote" to true))
                updateDocument("levels", levelId, hashMapOf("upvotes" to FieldValue.increment(1),"downvotes" to FieldValue.increment(-1)))
            }
        }
    }

    // todo make this work pls
    fun sendToJs(function: String, parameter: String) {
        webView.post(Runnable() {
            fun run() {
                webView.loadUrl("javascript:$function($parameter)");
            }
        });
    }

    /** Adds an error to the database, so we can see if something is broken */
    suspend fun addError(error: String) {
        val newError = hashMapOf("error" to error, "errorDate" to FieldValue.serverTimestamp())
        addNewDocument("errors", newError)
    }

    // TODO: move all 'backend functions' which js does not need to know about to other class/file

    /** Adds a new document to a given collection and returns its automatically generated id if none was given. */
    suspend fun addNewDocument(collection: String, data: HashMap<String, *>, customId: String? = null): String {
        log("adding document to $collection with data $data")
        if (customId == null) return Firebase.firestore.collection(collection).add(data).await().id
        Firebase.firestore.collection(collection).document(customId).set(data).await()
        return customId
    }

    fun updateDocument(collection: String, document: String?, newData: HashMap<String, *>) {
        if (document == null) return
        Firebase.firestore.collection(collection).document(document).update(newData)
            .addOnSuccessListener { Log.d("TAG", "Document $collection-$document successfully updated!") }
            .addOnFailureListener { e -> Log.w("TAG", "Error updating document", e) }
    }

    /** Generates a new level as well as adding a reference to it to the user array
     *  Returns the id of the newly created level */
    suspend fun createLevel(levelSlot: String, levelString: String): String {
        val userId = getUserId()
        val newLevel = hashMapOf(
            "authorId" to userId,
            "authorName" to null, // Gets set on publish
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
        updateSlot(levelSlot, levelId)
        return levelId
    }

    /** Replaces a level slot in the user object with the new id (or removes it, if the new id is null) */
    suspend fun updateSlot(levelSlot: String, newLevelId: String?) {
        val userId = getUserId()
        val userData = getDocument("users", userId)
        if (userData == null || userData["levels"] == null) {
            addError("User $userId does not have a level map!"); return
        }
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

    suspend fun slotExists(levelSlot: String): Boolean {
        val userId = getUserId()
        val userData = getDocument("users", userId)
        if (userData == null || userData["levels"] == null) return false // TODO maybe: add error if the user couldn't be found?
        val levelDict = userData["levels"] as Map<String, String>
        return levelDict[levelSlot] != null
    }

    suspend fun getLevelId(levelSlot: String): String? {
        val userId = getUserId()
        val userData = getDocument("users", userId)
        if (userData == null || userData["levels"] == null) return null // TODO maybe: add error if the user couldn't be found?
        val levelDict = userData["levels"] as Map<String, String>
        if (levelDict[levelSlot] == null) addError("Did not find levelId at slot $levelSlot for user $userId")
        return levelDict[levelSlot]
    }

    suspend fun getDocument(collection: String, documentId: String?): MutableMap<String, Any>? {
        if (documentId == null) return null
        return try {
            Firebase.firestore.collection(collection).document(documentId).get().await().data
        } catch (e: Exception) {
            log("exception when getting! $e")
            null
        }
    }
}