# 🌦️ Weather Prediction App  
A full-stack weather prediction platform for Mexico, providing interactive rain maps, city forecasts, backend computations, and an optional Android mobile build through Capacitor.

This repository contains the **React.js frontend**, which connects to the FastAPI backend hosted on **Railway**.

---

## 🚀 Backend Information  
The backend is automatically deployed to Railway and served from:

🔗 **Backend Root URL:**  
https://weatherstorm-app-backend-weather-app.up.railway.app/

📦 **Backend Source Code:**  
https://github.com/luismdg/weatherstorm-app-backend

---

# 1. 📋 Prerequisites  
Before running the frontend, you must have:

- **Node.js** + **npm**
- (Optional) **Android Studio** if you want to build the mobile app using Capacitor

---

# 2. 🛠️ Frontend Setup

### Navigate to the frontend folder:
```bash
cd frontend
```

### Install dependencies:
```bash
npm install maplibre-gl leaflet react-leaflet three lucide-react
```

### Start the development server:
```bash
npm start
```

Your React frontend will run at:

👉 **http://localhost:3000/**

---

# 3. 📱 Running the Web App as a Mobile App (Capacitor Setup)

This project supports optional mobile builds using **Capacitor**.  
You **do NOT** modify the mobile code; the mobile app simply mirrors the webapp build.

Follow these steps **ONLY if you want the Android app version**:

---

## 3.1 Install Capacitor (if not installed yet)
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

---

## 3.2 Build the web application
```bash
npm run build
```

---

## 3.3 Copy the web build into the Android project
```bash
npx cap copy
```

*(If this is your first time setting up, run `npx cap add android` once.)*

---

## 3.4 Open Android Studio
```bash
npx cap open android
```

This opens the auto-generated Android project.

---

# 4. 📱 Running the App on a Physical Android Device (Wireless Debugging)

Follow these steps to install and test the app on your Android phone:

---

### 4.1 Enable Wireless Debugging on your phone  
On your Android device, go to:

**Settings → Developer Options → Wireless Debugging → Enable**

Then tap:

👉 **"Pair device with QR code"**

---

### 4.2 Show the QR Pairing Code in Android Studio  
Inside Android Studio:

1. Open the **Device Manager**  
2. Click **Pair using Wi-Fi**  
3. A **QR code** will appear  
4. Scan it with your phone

Your device will now connect to Android Studio.

---

### 4.3 Run the App  
In Android Studio:

- Press **▶ Run**
- Select your Android device

The app will install and run instantly on your phone.

---

# 5. 🌐 Project Workflow Summary

✔ Backend runs on Cloud (Railway)  
✔ Frontend runs locally with `npm start`  
✔ Optional Capacitor mobile build  
✔ Android device debugging supported

---

# 6. 🧩 Tech Stack

### **Frontend**
- React.js  
- MapLibre GL  
- Leaflet  
- Three.js  
- Capacitor (Android optional)

### **Backend**
- FastAPI  
- Python  
- Railway Deployment  

---

# 7. 📦 Project Setup After Cloning

After cloning both repositories:

### Frontend:
```bash
cd frontend
npm install
npm start
```

### Backend:
Already running in the cloud — **no need to install locally** unless desired.

---

# 📄 License  
This project is for personal, educational, and hobby use.

