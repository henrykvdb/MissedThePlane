package com.missedtheplane

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import com.google.android.gms.ads.admanager.AdManagerAdRequest
import com.google.android.gms.ads.admanager.AdManagerInterstitialAd
import com.google.android.gms.ads.admanager.AdManagerInterstitialAdLoadCallback
import com.google.android.ump.ConsentDebugSettings
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import java.util.concurrent.atomic.AtomicBoolean

const val BILLING_PRODUCT_ID_ADS = "remove_ads"
private val PRODUCT_LIST = listOf(
    QueryProductDetailsParams.Product.newBuilder()
        .setProductId(BILLING_PRODUCT_ID_ADS)
        .setProductType(BillingClient.ProductType.INAPP)
        .build()
)

open class BaseActivityAds : AppCompatActivity(), PurchasesUpdatedListener {
    //Advertisements
    private lateinit var consentInformation: ConsentInformation
    private var isMobileAdsInitializeCalled = AtomicBoolean(false)
    private var interstitialAd: AdManagerInterstitialAd? = null
    private var adIsLoading: Boolean = false

    // Billing
    private var adsEnabled = true
    private lateinit var billingClient: BillingClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Requesting an update to consent information should be called on every app launch.
        val params = ConsentRequestParameters.Builder().build()
        consentInformation = UserMessagingPlatform.getConsentInformation(this)
        consentInformation.requestConsentInfoUpdate(
            this,
            params,
            {
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(this) { formError ->
                    if (formError != null) { // Consent not obtained in current session.
                        log("Error ${formError.errorCode}: ${formError.message}")
                    } else if (consentInformation.canRequestAds()) initializeAds()
                }
            },
            { log("Error ${it.errorCode}: ${it.message}") }
        )

        // This sample attempts to load ads using consent obtained in the previous session.
        if (consentInformation.canRequestAds()) {
            initializeAds()
        }

        // Create the billing client
        setupBillingClient(false)
    }

    override fun onResume() {
        super.onResume()
        //billingClient.queryPurchasesAsync() // TODO
    }

    override fun onDestroy() {
        if (billingClient.isReady) {
            log("BillingClient can only be used once -- closing connection")
            billingClient.endConnection()
        }
        super.onDestroy()
    }

    private fun loadAd() {
        // Request a new ad if one isn't already loaded.
        if (adIsLoading || interstitialAd != null) return
        adIsLoading = true
        val adRequest = AdManagerAdRequest.Builder().build()

        AdManagerInterstitialAd.load(this, getString(R.string.admob_ad_id), adRequest,
            object : AdManagerInterstitialAdLoadCallback() {
                override fun onAdFailedToLoad(adError: LoadAdError) {
                    log("Ads load error; domain: ${adError.domain}, code: ${adError.code}, message: ${adError.message}")
                    interstitialAd = null
                    adIsLoading = false
                }

                override fun onAdLoaded(interstitialAd: AdManagerInterstitialAd) {
                    log("Ad was loaded")
                    this@BaseActivityAds.interstitialAd = interstitialAd
                    adIsLoading = false
                }
            }
        )
    }

    // Show the ad if it's ready, otherwise load one in background
    internal fun showInterstitial() {
        if (interstitialAd != null) {
            interstitialAd?.fullScreenContentCallback =
                object : FullScreenContentCallback() {
                    override fun onAdShowedFullScreenContent() = log("Ad showed fullscreen content.")
                    override fun onAdDismissedFullScreenContent() {
                        interstitialAd = null
                        log("Ad was dismissed.")
                    }
                    override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                        interstitialAd = null
                        log("Ad failed to show.")
                    }
                }

            interstitialAd?.show(this)
        } else if (consentInformation.canRequestAds()) loadAd()
    }

    fun setConsentAgeAds(age: Int){
        MobileAds.setRequestConfiguration(MobileAds.getRequestConfiguration().toBuilder().apply {
            // The tag for Children's Online Privacy Protection Act (COPPA)
            if (age <= 16) setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
            else setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_FALSE)

            // Age consent
            if (age < 18) setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE)
            else setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_FALSE)

            when { // Maximum ad content rating
                age > 18 -> setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_MA)
                age > 12 -> setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_T)
                age > 7 -> setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG)
                age > 3 -> setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
            }
        }.build())
    }

    private fun initializeAds() {
        if (isMobileAdsInitializeCalled.getAndSet(true)) {
            return // should only be called once
        }

        // Update the user age
        val age = getSharedPreferences(KEY_SHARED_PREFS, 0).getInt(KEY_FIRST_LAUNCH, -1)
        setConsentAgeAds(age)

        // Initialize the Mobile Ads SDK.
        MobileAds.initialize(this) { loadAd() }
    }

    fun setupBillingClient(buy: Boolean) {
        billingClient = BillingClient.newBuilder(this)
            .enablePendingPurchases().setListener(this).build()
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result0: BillingResult) {
                if (result0.responseCode == BillingClient.BillingResponseCode.OK) {
                    // Load previous purchases

                    billingClient.queryPurchasesAsync(
                        QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build()
                    ) { result1, purchases ->
                        if (result1.responseCode == BillingClient.BillingResponseCode.OK)
                            for (purchase in purchases)
                                acknowledgePurchase(purchase)
                    }

                    // Buy the ad unlock
                    if (buy) purchaseAdUnlock()
                } else Toast.makeText(this@BaseActivityAds, "Purchase failed", Toast.LENGTH_SHORT).show()
            }

            override fun onBillingServiceDisconnected() {
                log("Billing client connection failed")
            }
        })
    }

    private fun purchaseAdUnlock() = if (billingClient.isReady) {
        // Load detailed SKU's
        val params = QueryProductDetailsParams.newBuilder().setProductList(PRODUCT_LIST).build()
        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                for (productDetails in productDetailsList) if (productDetails.productId == BILLING_PRODUCT_ID_ADS) {
                    // Buy the ad unlock
                    //val offerToken = productDetails.subscriptionOfferDetails?.get(selectedOfferIndex)?.offerToken
                    val productDetailsParamsList =
                        listOf(
                            BillingFlowParams.ProductDetailsParams.newBuilder()
                                .setProductDetails(productDetails)
                                //.setOfferToken(offerToken)
                                .build()
                        )
                    val billingFlowParams =
                        BillingFlowParams.newBuilder()
                            .setProductDetailsParamsList(productDetailsParamsList)
                            .build()

                    // Launch the billing flow
                    billingClient.launchBillingFlow(this, billingFlowParams)
                }
            } else Toast.makeText(this, "Purchase failed", Toast.LENGTH_SHORT).show()
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
                adsEnabled = false
                log("ADS REMOVED")
            } else {
                val params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                billingClient.acknowledgePurchase(params) { billingResult ->
                    log(billingResult.debugMessage)
                    log(billingResult.responseCode.toString())
                    adsEnabled = false
                    log("ADS REMOVED")
                }
            }
        }
    }
}