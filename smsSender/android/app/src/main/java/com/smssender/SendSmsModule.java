package com.smssender;

import android.telephony.SmsManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class SendSmsModule extends ReactContextBaseJavaModule {

    public SendSmsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SendSms";
    }

    @ReactMethod
    public void sendSMS(String number, String message, Promise promise) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(number, null, message, null, null);
            promise.resolve("SMS_SENT");
        } catch (Exception e) {
            promise.reject("SMS_FAILED", e.getMessage());
        }
    }
}
