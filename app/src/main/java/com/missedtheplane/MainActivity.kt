package com.missedtheplane

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*
import com.android.billingclient.api.BillingClient.SkuType
import com.google.ads.mediation.admob.AdMobAdapter
import com.google.android.gms.ads.*
import kotlinx.android.synthetic.main.activity_test.*


fun log(msg: String) {
    Log.d("MTP", msg)
}

@SuppressLint("SetJavaScriptEnabled")
class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {
    private lateinit var webView: WebView
    private lateinit var billingClient: BillingClient
    private var premium = false
    /*private val purchaseUpdateListener =
        PurchasesUpdatedListener { billingResult, purchases ->
            // To be implemented in a later section.
            log("purchaseUpdateListener")
        }*/

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

        /*if (purchasesResult.purchasesList != null) {
            for (purchase in purchasesResult.purchasesList!!) {
                if (purchase.sku == "your_product_id") handlePurchase(purchase)
            }
        }*/
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
            .enablePendingPurchases().setListener(this).build()
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    // The BillingClient is ready. You can query purchases here.
                    log("Setup Billing Done")

                    val purchasesResult = billingClient.queryPurchases(SkuType.INAPP)
                    log("HEY THIS IS THE LIST; ${purchasesResult.purchasesList}")

                    log("loading sku's")
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

    private val skuList = listOf("remove_ads")
    private fun loadAllSKUs() = if (billingClient.isReady) {
        val params = SkuDetailsParams.newBuilder().setSkusList(skuList).setType(SkuType.INAPP).build()
        billingClient.querySkuDetailsAsync(params) { billingResult, skuDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && skuDetailsList?.isNotEmpty() == true) {
                for (skuDetails in skuDetailsList) {
                    if (skuDetails.sku == "remove_ads") {
                        buttonBuyProduct.setOnClickListener {
                            val billingFlowParams = BillingFlowParams.newBuilder().setSkuDetails(skuDetails).build()
                            billingClient.launchBillingFlow(this, billingFlowParams)
                        }
                    }
                }
            }

        }
    } else {
        log("Billing Client not ready")
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) acknowledgePurchase(purchase)
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            log("User Cancelled: (${billingResult.debugMessage})")
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            log("Product already owned")
        } else log("Billing error: (${billingResult.debugMessage})")
    }

    private fun acknowledgePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            premium = true
            if (!purchase.isAcknowledged) {
                val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                billingClient.acknowledgePurchase(params) { billingResult ->
                    log(billingResult.debugMessage)
                    log(billingResult.responseCode.toString())
                    premium = true
                }
            }
        }
    }
}