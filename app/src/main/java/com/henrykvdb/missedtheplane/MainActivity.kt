package com.henrykvdb.missedtheplane

import androidx.appcompat.app.AppCompatActivity
import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.view.View
import android.webkit.WebView
import android.widget.TextView

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
class MainActivity : AppCompatActivity() {
	@SuppressLint("ClickableViewAccessibility", "SetJavaScriptEnabled")
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		setContentView(R.layout.activity_fullscreen)
		//supportActionBar?.setDisplayHomeAsUpEnabled(true)

		// Set up webview
		val game = findViewById<WebView>(R.id.game_view)
		game.settings.javaScriptEnabled = true;
		game.settings.allowFileAccessFromFileURLs = true
		game.loadUrl("file:///android_asset/index.html")

		// Trigger the initial hide() shortly after the activity has been  created, to briefly hint
		// to the user that UI controls are available.
		Handler().postDelayed({
			game.systemUiVisibility =
					View.SYSTEM_UI_FLAG_LOW_PROFILE or
							View.SYSTEM_UI_FLAG_FULLSCREEN or
							View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
							View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
							View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
							View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
		}, 500)
	}

}