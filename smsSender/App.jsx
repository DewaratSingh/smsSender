// App.jsx
import React, { useState, useEffect } from 'react';
import {
  PermissionsAndroid,
  Platform,
  Alert,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { connectToServer, onServer, emitToServer } from './src/socket';

const { SendSms } = NativeModules;

// For incoming SMS events
const smsEventEmitter = new NativeEventEmitter();

export default function App() {
  const [serverUrl, setServerUrl] = useState('');
  const [logs, setLogs] = useState([]);

  function addLog(text) {
    setLogs(prev => [...prev, text]);
  }

  // 🔥 LISTEN FOR INCOMING SMS FROM NATIVE MODULE
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('smsReceived', data => {
      addLog(`📩 Incoming SMS from ${data.sender}: ${data.message}`);

      // Forward to server
      emitToServer('sms-status', {
        from: data.sender,
        message: data.message,
        type: "INCOMING_SMS"
      });
    });

    return () => subscription.remove();
  }, []);

  // 📌 Request permissions
  async function requestPermissions() {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ]);

      return (
        granted['android.permission.SEND_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  // 🔌 Connect to server
  const connectHandler = async () => {
    if (!serverUrl) {
      Alert.alert('Error', 'Enter server URL');
      return;
    }

    addLog('Connecting to ' + serverUrl);
    connectToServer(serverUrl);
    addLog('Connected to ' + serverUrl);

    const granted = await requestPermissions();
    if (!granted) {
      addLog('❌ SMS Permissions not granted');
      return;
    }

    // Listen for server -> send-sms
    onServer('send-sms', async data => {
      addLog('📤 Send SMS Request: ' + JSON.stringify(data));

      try {
        await SendSms.sendSMS(data.number, data.message);

        addLog(`✅ SMS SENT to ${data.number}`);

        emitToServer('sms-status', {
          status: 'SMS_SENT',
          number: data.number,
          message: data.message,
        });
      } catch (err) {
        addLog('❌ SMS ERROR: ' + err);

        emitToServer('sms-status', {
          status: 'FAILED',
          number: data.number,
          message: data.message,
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMS Sender App</Text>

      <TextInput
        style={styles.input}
        placeholder="ws://192.168.1.5:4000"
        value={serverUrl}
        onChangeText={setServerUrl}
      />

      <Button title="Connect" onPress={connectHandler} />

      <ScrollView style={styles.logBox}>
        {logs.map((t, i) => (
          <Text key={i}>{t}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    padding: 10,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  logBox: {
    marginTop: 20,
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
});
