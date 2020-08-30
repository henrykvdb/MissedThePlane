package com.missedtheplane

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*
import com.google.ads.mediation.admob.AdMobAdapter
import com.google.android.gms.ads.*

fun log(msg: String) {
    Log.d("MTP", msg)
}

@SuppressLint("SetJavaScriptEnabled")
class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {
    private lateinit var webView: WebView
    private lateinit var billingClient: BillingClient
    private val skuList = listOf("remove_ads")
    private val purchaseUpdateListener =
        PurchasesUpdatedListener { billingResult, purchases ->
            // To be implemented in a later section.
            log("purchaseUpdateListener")
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_fullscreen)

        // Set up WebView
        webView = findViewById(R.id.game_view)
        webView.settings.javaScriptEnabled = true
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.allowFileAccessFromFileURLs = true
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.addJavascriptInterface(JavaScriptInterface(this, webView), "Android")
        webView.loadUrl("file:///android_asset/index.html")

        //Handler().postDelayed( {},5000)
        //setupBillingClient()
        //createAd() //TODO add actual ad id when we release
    }

    override fun onPause() {
        webView.onPause()
        webView.pauseTimers()
        webView.loadUrl("javascript:pauseSound()")
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.resumeTimers()
        webView.onResume()
        webView.loadUrl("javascript:resumeSound()")
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
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

    var consent = false
    fun createAd() {
        MobileAds.setRequestConfiguration(MobileAds.getRequestConfiguration().toBuilder().apply {
            // The tag for Children's Online Privacy Protection Act (COPPA)
            setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)

            // Age consent
            setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE)

            // Maximum ad content rating
            setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG) // Parental guidence
        }.build())
        MobileAds.initialize(this)

        InterstitialAd(this).apply {
            adUnitId = "ca-app-pub-3940256099942544/1033173712"//getString(R.string.admob_ad_id)

            //GDPR bitch
            Log.e("ADMOB", "Loading ad consent: $consent")
            val builder = AdRequest.Builder()
            if (!consent) {
                val extras = Bundle()
                extras.putString("npa", "1")
                builder.addNetworkExtrasBundle(AdMobAdapter::class.java, extras)
            }
            loadAd(builder.build())

            adListener = object : AdListener() {
                override fun onAdLoaded() = show()
                override fun onAdFailedToLoad(p0: Int) {
                    Log.e("ADMOB", "Ad failed to load (code $p0)")
                }
            }
        }
    }

    private fun setupBillingClient() {
        billingClient = BillingClient.newBuilder(this)
            .enablePendingPurchases()
            .setListener(purchaseUpdateListener)
            .build()
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    // The BillingClient is ready. You can query purchases here.
                    log("Setup Billing Done")
                    loadAllSKUs()
                }
            }

            override fun onBillingServiceDisconnected() {
                // Try to restart the connection on the next request to
                // Google Play by calling the startConnection() method.
                log("Failed")

            }
        })
    }

    private fun loadAllSKUs() = if (billingClient.isReady) {
        val params = SkuDetailsParams.newBuilder().setSkusList(skuList)
            .setType(BillingClient.SkuType.INAPP).build()
        billingClient.querySkuDetailsAsync(params) { billingResult, skuDetailsList ->
            // Process the result.
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && skuDetailsList?.isNotEmpty() == true) {
                for (skuDetails in skuDetailsList) {
                    log("hey loading $skuDetails")
                    if (skuDetails.sku == "test_product_one") {
                        /*buttonBuyProduct.setOnClickListener { //TODO handle buy somewhere
                            log("pressed button")
                            val billingFlowParams = BillingFlowParams
                                .newBuilder()
                                .setSkuDetails(skuDetails)
                                .build()
                            billingClient.launchBillingFlow(this, billingFlowParams)
                        }*/
                    }
                }
            }
            if (skuDetailsList?.size ?: 0 > 0) skuDetailsList?.get(0)?.description?.let { log(it) }

        }

    } else {
        println("Billing Client not ready")
    }

    override fun onPurchasesUpdated(
        billingResult: BillingResult,
        purchases: MutableList<Purchase>?
    ) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                acknowledgePurchase(purchase.purchaseToken)

            }
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            // Handle an error caused by a user cancelling the purchase flow.
            log("User Cancelled")
            log(billingResult.debugMessage.toString())


        } else {
            log(billingResult.debugMessage.toString())
            // Handle any other error codes.
        }
    }


    private fun acknowledgePurchase(purchaseToken: String) {
        val params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchaseToken)
            .build()
        billingClient.acknowledgePurchase(params) { billingResult ->
            val responseCode = billingResult.responseCode
            val debugMessage = billingResult.debugMessage
            log(debugMessage)
            log(responseCode.toString())
        }
    }
}