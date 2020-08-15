package com.henrykvdb.missedtheplane

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Point
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity


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
    }
}