
## Backend Setup

### Step 1: Install Dependencies
Navigate to the backend folder and install the required dependencies:
```sh
cd backend
npm install
```
#### Required Dependencies:
```json
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "mongoose": "^8.13.1",
  "nodemon": "^3.1.9",
  "socket.io": "^4.8.1",
  "uuid": "^11.1.0"
}
```

### Step 2: Create a `.env` File
In the backend directory, create a `.env` file and add the following environment variables:
```
MONGO_URI=your_mongodb_connection_string
PORT=your_backend_port
```

### Step 3: Run Backend
```sh
nodemon server.js
```

---


