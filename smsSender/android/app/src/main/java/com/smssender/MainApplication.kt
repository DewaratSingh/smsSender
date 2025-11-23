package com.smssender

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.bridge.ReactContext
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

    companion object {
        private var reactContext: ReactContext? = null

        @JvmStatic
        fun setReactContext(context: ReactContext) {
            reactContext = context
        }

        @JvmStatic
        fun getReactContext(): ReactContext? {
            return reactContext
        }
    }

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {
                add(SendSmsPackage())
            }
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}
