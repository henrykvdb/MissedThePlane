package com.missedtheplane

import android.annotation.SuppressLint
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import androidx.webkit.WebViewAssetLoader.ResourcesPathHandler
import com.android.billingclient.api.*
import com.google.android.gms.ads.*


fun log(msg: String) {
    Log.d("MTP", msg)
}

@SuppressLint("SetJavaScriptEnabled")
class MainActivity : BaseActivityAds() {
    private lateinit var webView: WebView
    private var onBackCallback = object: OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            moveTaskToBack(true);
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_fullscreen)

        // Set up WebView
        webView = findViewById(R.id.game_view)
        webView.settings.javaScriptEnabled = true
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", AssetsPathHandler(this))
            .addPathHandler("/res/", ResourcesPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }
        }

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.addJavascriptInterface(JavaScriptInterface(this, webView), "Android")
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");

        // Make back button not finish() application
        onBackPressedDispatcher.addCallback(this, onBackCallback)
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
        onBackCallback.remove()
        super.onDestroy()
    }

    override fun onStart() {
        super.onStart()
        hideUi()
    }

    fun hideUi() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }
}