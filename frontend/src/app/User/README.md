## Frontend Setup

### Step 1: Install Dependencies
Navigate to the frontend folder and install the required dependencies:
```sh
cd frontend
npm install
```
#### Required Dependencies:
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
},
"devDependencies": {
  "@eslint/eslintrc": "^3",
  "@tailwindcss/postcss": "^4",
  "eslint": "^9",
  "eslint-config-next": "15.2.3",
  "tailwindcss": "^4"
}
```

### Step 2: Run Frontend
```sh
npm run dev
```

---

### Lighthouse SDK Setup
1. Log in to [Lighthouse Storage](https://files.lighthouse.storage/).
2. Generate an API Key.
3. Create a `.env` file in the root directory and add:
   ```sh
   LIGHTHOUSE_API_KEY=your_api_key_here
   ```
4. Update `User.js`:
   ```js
   const apiKey = process.env.LIGHTHOUSE_API_KEY;
   ```

