package com.missedtheplane

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*
import com.android.billingclient.api.BillingClient.SkuType
import com.google.ads.mediation.admob.AdMobAdapter
import com.google.android.gms.ads.*

fun log(msg: String) {
    Log.d("MTP", msg)
}

@SuppressLint("SetJavaScriptEnabled")
class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {
    private lateinit var webView: WebView
    private lateinit var billingClient: BillingClient
    var showAds = true

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

        setupBillingClient(false)
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
        hideUi()
    }

    fun hideUi(){
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

    fun setupBillingClient(buy: Boolean) {
        billingClient = BillingClient.newBuilder(this)
            .enablePendingPurchases().setListener(this).build()
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    // Load previous purchases
                    val purchasesResult = billingClient.queryPurchases(SkuType.INAPP)
                    if(purchasesResult.purchasesList!=null) for (purchase in purchasesResult.purchasesList!!) {
                        acknowledgePurchase(purchase)
                    }

                    // Buy the ad unlock
                    if(buy) purchaseAdUnlock()
                }
                else Toast.makeText(this@MainActivity, "User not logged in", Toast.LENGTH_SHORT).show()
            }

            override fun onBillingServiceDisconnected() {
                log("Billing client connection failed")
            }
        })
    }

    private val skuList = listOf("remove_ads")
    private fun purchaseAdUnlock() = if (billingClient.isReady) {
        // Load detailed SKU's
        val params = SkuDetailsParams.newBuilder().setSkusList(skuList).setType(SkuType.INAPP).build()
        billingClient.querySkuDetailsAsync(params) { billingResult, skuDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && skuDetailsList?.isNotEmpty() == true) {
                for (skuDetails in skuDetailsList) if (skuDetails.sku == "remove_ads") {
                    // Buy the ad unlock
                    val billingFlowParams = BillingFlowParams.newBuilder().setSkuDetails(skuDetails).build()
                    billingClient.launchBillingFlow(this, billingFlowParams)
                }
            }
            else Toast.makeText(this, "Purchase failed", Toast.LENGTH_SHORT).show()
        }
    } else log("Billing Client not ready")

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) acknowledgePurchase(purchase)
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            log("User Cancelled: (${billingResult.debugMessage})")
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            log("Product already owned")
        } else Toast.makeText(this, "Purchase failed", Toast.LENGTH_SHORT).show()
    }

    private fun acknowledgePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            if (purchase.isAcknowledged) {
                showAds = false
                log("ADS REMOVED")
            } else {
                val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                billingClient.acknowledgePurchase(params) { billingResult ->
                    log(billingResult.debugMessage)
                    log(billingResult.responseCode.toString())
                    showAds = false
                    log("ADS REMOVED")
                }
            }
        }
    }
}