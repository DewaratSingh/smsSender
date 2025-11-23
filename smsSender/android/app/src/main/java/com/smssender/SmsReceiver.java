package com.smssender;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        Bundle bundle = intent.getExtras();
        if (bundle == null)
            return;

        Object[] pdus = (Object[]) bundle.get("pdus");
        if (pdus == null)
            return;

        for (Object pdu : pdus) {

            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);

            String sender = sms.getDisplayOriginatingAddress();
            String message = sms.getMessageBody();

            // 🚀 Send SMS to React Native (no logs, no toast)
            sendToReactNative(sender, message);
        }
    }

    private void sendToReactNative(String sender, String message) {
        ReactContext reactContext = MainApplication.getReactContext();
        if (reactContext != null) {
            WritableMap map = Arguments.createMap(); 
            map.putString("sender", sender);
            map.putString("message", message);

            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("smsReceived", map);
        }
    }
}
