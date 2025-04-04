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
  ![image](https://github.com/user-attachments/assets/7a695fae-0de5-47b8-835c-9db14d5c8a8f)


- **Affiliate Dashboard** – Track earnings and product performance.
    ![image](https://github.com/user-attachments/assets/9df157e8-85e8-48fc-8ac6-7cb5153de4fd)
  
- **Affiliate Recommendation** – AI-based influencer-product matching.
    ![image](https://github.com/user-attachments/assets/b53aeac2-81ee-4a30-a85f-ae77cc31101c)  

- **Affiliating a Product** – Easy product affiliation for influencers.
  ![image](https://github.com/user-attachments/assets/92613ef2-2c38-423e-841b-16098db7381f)

- **Recently Affiliated Products** – View latest promotions.
  ![image](https://github.com/user-attachments/assets/ef3355b5-9d12-40be-9436-3601084dc25d)
  
- **Details Page** – Deep insights into product performance.
  ![image](https://github.com/user-attachments/assets/2711e100-53c2-4651-a091-db3adc57aa66)

- **Notification System** – Stay updated with important alerts.
  ![image](https://github.com/user-attachments/assets/f36b129a-451d-4f95-b5a3-43bed8045d9d)

  
- **Company Dashboard** – Manage products and partnerships.
    ![image](https://github.com/user-attachments/assets/4cbcbf27-ff61-4c7d-8e46-a43202802d70)

- **Company Add Product** – Add new products for affiliate marketing.
  ![image](https://github.com/user-attachments/assets/67c0962a-d750-4e21-b9ff-01ee74ff6305)

- **About Page** – Information about Affilify.
    ![image](https://github.com/user-attachments/assets/b8112ebf-c7d7-452a-9e20-8c02fdf17ab5)

- **Clicking Links & Data on Blockchain** – Ensures tamper-proof sales tracking.
    ![image](https://github.com/user-attachments/assets/d39db05d-1f73-4404-894c-b33cd0c62e6c)
  ![image](https://github.com/user-attachments/assets/130517c9-7928-448c-b146-8d54c3bb092e)

  -**Data on Blockchain**
  ![image](https://github.com/user-attachments/assets/113f2448-dd44-486f-b679-976a34dc23a3)

  



---

## 🔮 Future Plans
🚀 **Upcoming Enhancements:**
- **Rank-Based Algorithm** – Dynamic ranking for better affiliate selection.
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

