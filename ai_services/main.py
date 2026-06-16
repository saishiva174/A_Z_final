from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import xgboost as xgb
import shap
import uvicorn

app = FastAPI(
    title="AZ Services AI Matching Engine",
    description="Real-time XGBoost and SHAP pipeline for household professional ranking."
)

# Global variables to hold our model and explainer snapshot in memory
model = None
explainer = None

# 1. Load the pre-trained model and initialize SHAP when the server boots up
@app.on_event("startup")
def load_ai_assets():
    global model, explainer
    try:
        model = xgb.XGBClassifier()
        # Loads the binary classification model file we generated earlier
        model.load_model("household_matcher.json")
        
        # Initialize the SHAP TreeExplainer for Explainable AI (XAI)
        explainer = shap.TreeExplainer(model)
        print("🧠 XGBoost Model & SHAP Explainer loaded into memory cleanly!")
    except Exception as e:
        print(f"❌ Critical error loading machine learning assets: {str(e)}")

# 2. Define structural data schemas using Pydantic validation layers
class ProfessionalCandidate(BaseModel):
    id: int
    name: str
    service: str
    rate: float
    rating: float
    total_reviews: int
    is_verified: int
    distance: float
    profile_pic_url: Optional[str] = None
    location: Optional[str] = None

class MatchingPayload(BaseModel):
    professionals: List[ProfessionalCandidate]

# 3. The Core Inference and Explanation Endpoint
# --- 🩺 AUTOMATED KEEP-ALIVE HEALTH CHECK ---
@app.get("/")
@app.head("/")
def system_health_check():
    return {
        "status": "healthy", 
        "engine": "AZ Services AI Matching Engine Active"
    }
@app.post("/rank-professionals")
def rank_professionals(payload: MatchingPayload):
    global model, explainer
    
    if model is None or explainer is None:
        raise HTTPException(status_code=500, detail="AI Engine components are uninitialized.")

    try:
        # Convert incoming list of Pydantic models cleanly into a list of dictionaries
        raw_data = [pro.dict() for pro in payload.professionals]
        
        # Wrap input rows into a Pandas DataFrame
        df_full = pd.DataFrame(raw_data)
        
        # Extract exclusively the specific features our XGBoost model expects (Strict Column Ordering)
        feature_columns = ['distance', 'rate', 'rating', 'total_reviews', 'is_verified']
        X_features = df_full[feature_columns]

        # Calculate booking success probabilities (Outputs matrix of shape [N, 2])
        # Column index 1 represents probability of class 1 (successful booking conversion)
        probabilities = model.predict_proba(X_features)[:, 1]
        
        # Generate SHAP base importance values to deduce feature weights
        shap_values = explainer.shap_values(X_features)

        ranked_output = []
        for i in range(len(raw_data)):
            # Find the feature index that had the highest positive influence for this specific row
            top_feature_idx = shap_values[i].argmax()
            winning_feature = feature_columns[top_feature_idx]
            
            # Map the feature matrix column string name into human-readable text
            reason_mappings = {
                "distance": "Located in close proximity to your location.",
                "rating": "Maintains an outstanding historical satisfaction rating.",
                "total_reviews": "Highly experienced professional with strong volume on our platform.",
                "rate": "Offers highly competitive budget-friendly pricing values.",
                "is_verified": "Background verified and identity check cleared for security."
            }
            ai_reason = reason_mappings.get(winning_feature, "Strong profile compatibility indicators.")

            # Append calculated properties to our core profile metadata dictionary
            candidate_profile = raw_data[i]
            candidate_profile['match_score'] = round(float(probabilities[i]) * 100, 1)
            candidate_profile['ai_reason'] = ai_reason
            
            ranked_output.append(candidate_profile)

        # Sort the entire list in place: Highest match percentages first
        ranked_output.sort(key=lambda x: x['match_score'], reverse=True)
        return ranked_output

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Engine Runtime Failure: {str(e)}")

if __name__ == "__main__":
    import os
    # Render injection: Read the dynamic port assigned by the cloud platform, default to 8000 locally
    port = int(os.environ.get("PORT", 8000))
    
    # CRITICAL: Changing host to "0.0.0.0" allows the container to accept external cloud traffic
    uvicorn.run(app, host="0.0.0.0", port=port)