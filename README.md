# 🚀 Affilify – Blockchain-Powered AI Affiliate Marketing Platform

## 🔥 Project Overview
Affilify is an innovative affiliate marketing platform that combines **AI-powered influencer-brand matching** with **blockchain-verified transactions** to create a transparent, fraud-proof, and efficient ecosystem.

### 🚨 Problem Statement
Traditional affiliate marketing faces several challenges:
- ❌ **Unfair commissions** – Influencers often receive underpayments.
- ❌ **Fake metrics & fraud** – Businesses struggle to track genuine conversions.
- ❌ **Delayed payments** – Affiliates endure long payout cycles.

### ✅ Our Solution
Affilify ensures **trust, transparency, and efficiency** through AI-driven influencer matching and blockchain-based transaction verification.

### ⚡ Key Features & Benefits
- ✅ **AI-Powered Influencer Matching** – Recommends the best partnerships for higher conversions.
- ✅ **Blockchain-Verified Sales** – Eliminates fraud with tamper-proof tracking.
- ✅ **Instant Commission Payouts** – Smart contracts ensure real-time payments.
- ✅ **Decentralized Reputation System** – Ranks influencers based on actual performance.
- ✅ **User-Friendly Platform** – No technical expertise required – anyone can start earning!

### 🎯 Why Affilify?
Affilify creates a **win-win ecosystem** where businesses **maximize ROI**, influencers **get fair rewards**, and consumers **experience authentic promotions** – **revolutionizing affiliate marketing with AI and blockchain.** 🚀

---

## 🛠️ Technical Information

### 💡 Prerequisites
Before running the project, make sure you have:
- **MetaMask Wallet** installed in your browser.
- **Node.js & npm** installed for the frontend.
- **Python & pip** installed for the backend.

### 📂 Project Structure
The project consists of **two main folders** and a `main.py` file:

```
📂 Affilify
 ├── 📂 frontend/   # Frontend (Next.js + React)
 ├── 📂 backend/    # Backend (Node.js + Express)
 ├── 📝 main.py     # AI-based recommendation system (FastAPI)
```

---

## 🎨 Frontend Setup (Next.js + React)

### 🔧 Installation
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

### 📦 Required Dependencies
```json
"dependencies": {
    "@lighthouse-web3/sdk": "^0.3.7",
    "axios": "^1.8.4",
    "chart.js": "^4.4.8",
    "framer-motion": "^12.5.0",
    "lighthouse": "^12.5.1",
    "next": "15.2.3",
    "react": "^19.0.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.1",
    "socket.io-client": "^4.8.1",
    "web3": "^4.16.0"
}
```

### 🚀 Run the Frontend
```bash
npm run dev
```

---

## 🔙 Backend Setup (Node.js + Express + MongoDB)

### 🔧 Installation
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

### 🛠️ Environment Variables (`.env`)
Create a `.env` file in the backend directory with:
```
MONGO_URI=your_mongodb_connection_string
PORT=8000
```

### 🚀 Run the Backend
```bash
nodemon server.js
```

---

## 🤖 ML Recommendation System (FastAPI)

### 🔧 Installation
Install required Python packages:
```bash
pip install fastapi uvicorn pandas numpy scikit-learn scipy motor python-dotenv pydantic
```

### 🚀 Run the AI Service
```bash
uvicorn main:app --reload --port 8000
```

---

## 🌐 Platform Overview
Affilify consists of **two portals**:
1️⃣ **Affiliate Portal** – Manage affiliations, track performance, and receive payouts.
2️⃣ **Company Portal** – Add products, select influencers, and analyze conversions.

### 🏆 Features
- **Auth.js** – Secure authentication.
  ![image](https://github.com/user-attachments/assets/92691368-9ebd-44bb-b333-0f9957e15c35)


- **Affiliate Dashboard** – Track earnings and product performance.
    ![image](https://github.com/user-attachments/assets/5299a587-07a1-43ce-8d8f-9db9378b377c)

  
- **Affiliate Recommendation** – AI-based influencer-product matching.
    ![image](https://github.com/user-attachments/assets/1afc103d-cfa9-4ae9-b2b6-e72459bedbc2)
  ![image](https://github.com/user-attachments/assets/294614f3-7419-4aff-82f1-8eb4b83def4c)



- **Affiliating a Product** – Easy product affiliation for influencers.
  ![image](https://github.com/user-attachments/assets/06c9f60d-71e2-4563-bd67-669ef515c522)


- **Recently Affiliated Products** – View latest promotions.
  ![image](https://github.com/user-attachments/assets/1afc103d-cfa9-4ae9-b2b6-e72459bedbc2)

  -**Transaction Details** - Details about transaction along with cid
  ![image](https://github.com/user-attachments/assets/6867274b-23ea-431f-9a1b-9a5bdead2a04)
  ![image](https://github.com/user-attachments/assets/186f03ac-f011-4b3b-9f72-7ce8e92808f5)


  
- **Details Page** – Deep insights into product performance.
  ![image](https://github.com/user-attachments/assets/fb22314d-92cf-435b-9424-6a254f2691b2)


- **Notification System** – Stay updated with important alerts.
  ![image](https://github.com/user-attachments/assets/f36b129a-451d-4f95-b5a3-43bed8045d9d)

  
- **Company Dashboard** – Manage products and partnerships.
    ![image](https://github.com/user-attachments/assets/261d1998-7b88-4e02-ae51-0e7757ab77e9)


- **Company Add Product** – Add new products for affiliate marketing.
 ![image](https://github.com/user-attachments/assets/ac8cebc6-474f-4577-bea4-0940c8cebf3a)

-**Company Transaction** - Shows transaction of products created by company
![image](https://github.com/user-attachments/assets/095b4b89-83e9-4f3a-855d-1285de634fed)

-**Finding Affiliates **- Finding affiliates using similarity score 
![image](https://github.com/user-attachments/assets/332adad4-5b42-4078-a6d8-21e07c657c86)

- **About Page** – Information about Affilify.
   ![image](https://github.com/user-attachments/assets/c052478a-11fd-49c6-95f8-3a8dca5cb0b4)
  ![image](https://github.com/user-attachments/assets/64d7fdde-d379-4699-986b-955aafb32d48)


- **Clicking Links & Data on Blockchain** – Ensures tamper-proof sales tracking.
    ![image](https://github.com/user-attachments/assets/d39db05d-1f73-4404-894c-b33cd0c62e6c)
  ![image](https://github.com/user-attachments/assets/130517c9-7928-448c-b146-8d54c3bb092e)

  -**Data on Blockchain**
  ![image](https://github.com/user-attachments/assets/113f2448-dd44-486f-b679-976a34dc23a3)

  
AWS SS :
![WhatsApp Image 2025-11-08 at 19 11 56_75597947](https://github.com/user-attachments/assets/4fb693b7-93f2-45fa-b769-9c5182027880)

![WhatsApp Image 2025-11-08 at 19 12 45_799482d2](https://github.com/user-attachments/assets/e1ae2987-297c-490a-b362-f5505201c7b4)

![WhatsApp Image 2025-11-08 at 19 17 34_19bc69be](https://github.com/user-attachments/assets/853dc4cd-92ed-4f45-8ff4-985937bf0b74)

![WhatsApp Image 2025-11-09 at 00 27 03_dc566834](https://github.com/user-attachments/assets/1e3639df-38ba-4869-9ea5-a5e132229dca)

![WhatsApp Image 2025-11-09 at 00 29 45_6065ad35](https://github.com/user-attachments/assets/adc509f5-cf87-40cb-8220-8a34c571bc05)


---

## 🔮 Future Plans
🚀 **Upcoming Enhancements:**
- **Instagram Scraping** – AI-driven influencer insights (with user consent).
- **AI ChatBot Integration** – Seamless user experience & automated support.

---

## ❤️ Contributing
Want to improve Affilify? Feel free to **fork**, **submit issues**, or **open pull requests**!

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 📞 Contact
For any queries, reach out at 📧 **apekshajamjar4@gmail.com**

---

🌟 **Join us in revolutionizing affiliate marketing with AI & Blockchain!** 🌟

