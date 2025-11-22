// App.js
import React, { useState } from 'react';
import { PermissionsAndroid, Platform, Alert, NativeModules } from 'react-native';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { connectToServer, onServer, emitToServer } from './src/socket';

const { SendSms } = NativeModules; // Our native module

export default function App() {
  const [serverUrl, setServerUrl] = useState('');
  const [logs, setLogs] = useState([]);

  function addLog(text) {
    setLogs(prev => [...prev, text]);
  }

  // Request SMS permission for Android
  async function requestSmsPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'App needs permission to send SMS directly',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS fallback
  }

  const connectHandler = () => {
    if (!serverUrl) {
      Alert.alert('Error', 'Enter server URL');
      return;
    }
    addLog('Connecting to ' + serverUrl);
    const socket = connectToServer(serverUrl);
    addLog('Connected to ' + serverUrl);

    onServer('send-sms', async data => {
      addLog('SMS Request: ' + JSON.stringify(data));

      const hasPermission = await requestSmsPermission();
      if (!hasPermission) {
        addLog('SMS Permission Denied');
        return;
      }

      try {
        // Call native module to send SMS silently
        const result = await SendSms.sendSMS(data.number, data.message);
        addLog('SMS SENT: ' + data.number + ' → ' + data.message);

        emitToServer('sms-status', {
          status: 'SMS_SENT',
          number: data.number,
          message: data.message,
        });
      } catch (error) {
        addLog('SMS ERROR: ' + error);
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
        {logs.map((text, i) => (
          <Text key={i}>{text}</Text>
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
