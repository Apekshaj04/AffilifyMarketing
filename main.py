from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix, hstack
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://Apeksha:Apeksha@cluster0.eat6d8r.mongodb.net/Products")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URI)
db = client["Products"]
products_collection = db["products"]

async def load_data():
    cursor = products_collection.find()
    products = await cursor.to_list(length=None)
    df = pd.DataFrame(products)
    return df

async def preprocess_data():
    df = await load_data()

    if df.empty:
        raise ValueError("No products found in MongoDB.")

    if "price" in df.columns and "actual_price" not in df.columns:
        df.rename(columns={"price": "actual_price"}, inplace=True)

    if "category" in df.columns and "main_category" not in df.columns:
        df.rename(columns={"category": "main_category"}, inplace=True)

    required_columns = ["_id", "name", "main_category", "sub_category", "actual_price"]
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise KeyError(f"Missing required columns in MongoDB: {missing_columns}")

    df["actual_price"] = (
        df["actual_price"]
        .astype(str)
        .str.replace("[₹,]", "", regex=True)
        .replace("nan", np.nan)
        .astype(float)
        .fillna(df["actual_price"].mean())
    )

    encoder_main = LabelEncoder()
    df["main_category_encoded"] = encoder_main.fit_transform(df["main_category"].astype(str))

    encoder_sub = LabelEncoder()
    df["sub_category_encoded"] = encoder_sub.fit_transform(df["sub_category"].astype(str))

    df["combined"] = df["name"].astype(str) + " " + df["main_category"].astype(str) + " " + df["sub_category"].astype(str)

    tfidf = TfidfVectorizer(stop_words='english')
    text_features = tfidf.fit_transform(df["combined"])

    scaler = StandardScaler()
    numeric_features = ["main_category_encoded", "sub_category_encoded", "actual_price"]
    df_scaled = scaler.fit_transform(df[numeric_features])

    numeric_features_sparse = csr_matrix(df_scaled)

    X_combined = hstack([text_features, numeric_features_sparse])

    model = NearestNeighbors(metric='cosine', n_neighbors=7)
    model.fit(X_combined)

    return df, model, encoder_main, encoder_sub, scaler, tfidf

@app.on_event("startup")
async def startup_event():
    global df, model, encoder_main, encoder_sub, scaler, tfidf
    df, model, encoder_main, encoder_sub, scaler, tfidf = await preprocess_data()
    print("Data Loaded & Model Trained Successfully.")

class RecommendationRequest(BaseModel):
    main_category: str
    sub_category: str
    actual_price: float

@app.post("/recommend")
async def recommend(req: RecommendationRequest):
    try:
        df_new = pd.DataFrame([{
            "main_category": req.main_category,
            "sub_category": req.sub_category,
            "actual_price": req.actual_price
        }])

        try:
            df_new["main_category_encoded"] = encoder_main.transform(df_new["main_category"])
        except ValueError:
            df_new["main_category_encoded"] = encoder_main.transform([encoder_main.classes_[0]])

        try:
            df_new["sub_category_encoded"] = encoder_sub.transform(df_new["sub_category"])
        except ValueError:
            df_new["sub_category_encoded"] = encoder_sub.transform([encoder_sub.classes_[0]])

        df_new["combined"] = df_new["main_category"] + " " + df_new["sub_category"]
        df_new_scaled = scaler.transform(df_new[["main_category_encoded", "sub_category_encoded", "actual_price"]])
        text_features_new = tfidf.transform(df_new["combined"])

        X_new_combined = hstack([text_features_new, csr_matrix(df_new_scaled)])

        _, indices = model.kneighbors(X_new_combined, n_neighbors=7)

        recommendations = [
            {
                "_id": str(df.iloc[idx]["_id"]),
                "name": df.iloc[idx]["name"],
                "price": df.iloc[idx]["actual_price"],
                "category": df.iloc[idx]["main_category"],
                "sub_category": df.iloc[idx]["sub_category"],
                "image": df.iloc[idx].get("image", ""),
                "link": df.iloc[idx].get("link", "")
            }
            for idx in indices[0]
        ]

        return {"recommendations": recommendations}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error during recommendation processing.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
