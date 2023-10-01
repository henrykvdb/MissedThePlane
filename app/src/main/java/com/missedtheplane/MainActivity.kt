package com.missedtheplane

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*
import com.google.android.gms.ads.*


fun log(msg: String) {
    Log.d("MTP", msg)
}

@SuppressLint("SetJavaScriptEnabled")
class MainActivity : BaseActivityAds() {
    private lateinit var billingClient: BillingClient
    private lateinit var webView: WebView
    private val skuList = listOf("remove_ads")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_fullscreen)

        // Set up WebView
        webView = findViewById(R.id.game_view)
        webView.settings.javaScriptEnabled = true
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.allowFileAccessFromFileURLs = true
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.addJavascriptInterface(JavaScriptInterface(this, webView), "Android")
        webView.loadUrl("file:///android_asset/index.html")
    }

    // "Break" webview back behavior
    override fun onBackPressed() {
        moveTaskToBack(true)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if(hasFocus) hideUi()
    }

    override fun onPause() {
        webView.onPause()
        webView.loadUrl("javascript:pauseSound()")
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        hideUi()
        webView.onResume()
        webView.loadUrl("javascript:resumeSound()")
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    override fun onStart() {
        super.onStart()
        hideUi()
    }

    fun hideUi() {
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_LOW_PROFILE or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
    }
}