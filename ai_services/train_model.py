import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

# 1. Ingest the generated feature matrix
df = pd.read_csv('mock_bookings.csv')

# 2. Separate training vectors (X) from target outputs (y)
X = df[['distance', 'rate', 'rating', 'total_reviews', 'is_verified']]
y = df['booking_success']

# 3. Apply an 80/20 train-test validation partition split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🚀 Training structural XGBoost gradient booster...")

# 4. Initialize the evaluation hyperparameters
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42,
    eval_metric='logloss'
)

# 5. Fit the binary classifier weights
model.fit(X_train, y_train)

# 6. Evaluate accuracy performance metrics on the test partition
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n📈 Model Pipeline Trained! Evaluation Accuracy: {accuracy * 100:.2f}%")
print("\nDetailed Performance Diagnostics:")
print(classification_report(y_test, y_pred))

# 7. Serialize the model parameters directly into a JSON weight bundle
model.save_model('household_matcher.json')
print("💾 Saved snapshot asset as 'household_matcher.json'!")