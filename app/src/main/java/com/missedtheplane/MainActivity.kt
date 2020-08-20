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

        @JavascriptInterface
        fun getVersion(): String {
            return context.packageManager.getPackageInfo(context.packageName, 0).versionName
        }

        /** Updates this user highest reached level in the campaign */
        @JavascriptInterface
        fun setHighestLevel(userId: String, campaignIndex: Int) {
            // TODO: check if current isn't higher than new (we could do with increment but might be risky)
            updateDocument("users", userId, hashMapOf("highestLevel" to campaignIndex))
        }

        /** Publishes one of the levels the user currently has saved locally */
        @JavascriptInterface
        fun publishLevel(userId: String, levelIndex: Int, levelString: String) {
            // levelIndex could be used to verify?
            val newLevel = hashMapOf(
                "author" to userId,
                "levelString" to levelString,
                "submitDate" to FieldValue.serverTimestamp(),
                "plays" to 0,
                "clears" to 0
            )
            addNewDocument("publicLevels", newLevel)
        }

        /** Updates a given level in a certain user slot */
        @JavascriptInterface
        fun updateLevel(userId: String, levelIndex: Int, levelString: String) {

        }

        /** 'Deletes' a level in the database (marks it deleted), as well as freeing the spot in the user document */
        @JavascriptInterface
        fun deleteLevel(userId: String, levelIndex: Int) {

        }

        /** Generates a new level as well as adding a reference to it to the user array */
        @JavascriptInterface
        fun createNewLevel(userId: String, levelIndex: Int, levelString: String) {

        }

        /** Returns a list of dictionaries, each representing a level object (attributes like levelString, plays, rating, etc) */
        @JavascriptInterface
        fun getPublishedLevels() {

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
            val docRef = db.collection("cities").document("SF")
            docRef.get()
                .addOnSuccessListener { result ->
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