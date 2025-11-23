# SmsSender

A lightweight Node.js package to send SMS messages from your server
using a connected Android device.\
It uses **Socket.IO** to communicate with your Android app, enabling
real-time SMS sending and status updates.

------------------------------------------------------------------------

## 🚀 Features

-   Start an SMS server easily\
-   Send SMS from Node.js\
-   Receive delivery status events\
-   Works over local network / hotspot\
-   Simple API with minimal setup

------------------------------------------------------------------------

## 📥 Installation

``` bash
npm install @dewaratsingh/smssender
```

------------------------------------------------------------------------

## 📘 Usage Example (Express.js + Socket.IO)

### Below is a fully working server example that:

-   ✔ Starts the SMS server\
-   ✔ Sends an SMS when someone visits `/`\
-   ✔ Receives SMS sending status from Android\
-   ✔ Uses a single HTTP + Socket.IO server

``` js
const express = require("express");
const http = require("http");
const { startSmsServer, sendSMS, onSMSStatus } = require("@dewaratsingh/smssender");

const app = express();
const port = 3000;

// Create an HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Start SMS server (Socket.IO + internal logic)
startSmsServer({ server, port });

// Listen for SMS status updates from Android
onSMSStatus((data) => {
  console.log("SMS Status received:", data);
});

// Route to test SMS sending
app.get("/", (req, res) => {
  res.send("Hello World!");

  // Send an SMS when user visits this route
  sendSMS("+911234567890", "hi hello i am pawan");
});

// Start the server
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  console.log(`Socket.IO attached to the same port`);
});
```

------------------------------------------------------------------------

## 📡 API Reference

### 1. `startSmsServer()`

Starts the internal SMS Socket.IO server.

``` js
startSmsServer({ server, port });
```

  Name     Type          Description
  -------- ------------- -------------------------------
  server   http.Server   Existing HTTP server instance
  port     number        Port to run Socket.IO server

------------------------------------------------------------------------

### 2. `sendSMS(phoneNumber, message)`

Sends an SMS using the connected Android device.

``` js
sendSMS("+911234567890", "Your message here");
```

------------------------------------------------------------------------

### 3. `onSMSStatus(callback)`

Receives SMS sending and delivery reports.

``` js
onSMSStatus((data) => {
  console.log("SMS Status received:", data);
});
```

**Example status data:**

``` json
{
  "to": "+911234567890",
  "status": "sent",
  "timestamp": 1700000000
}
```

------------------------------------------------------------------------

## 📱 Android App Requirement

You need the companion Android app that:

-   Connects to your Node.js server\
-   Receives SMS send requests\
-   Sends SMS using native Android API\
-   Sends delivery status events

➡️ (Add your Android app GitHub / APK link here)

------------------------------------------------------------------------

## 🛜 Network Requirement

Both the Android device and server must be on the **same WiFi / hotspot
/ LAN**.

------------------------------------------------------------------------

## 🧑‍💻 Author

**Dewarat Singh**\
NPM: **@dewaratsingh**

------------------------------------------------------------------------

## 📄 License

MIT License\
You may use, modify, and distribute this package freely with credit.
