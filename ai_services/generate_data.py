import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)
num_samples = 5000

print("📊 Generating training data feature vectors...")


distance = np.random.uniform(0.5, 20.0, num_samples)       # Live distance in km (0.5 to 15km)
rate = np.random.uniform(15, 300, num_samples)             # Provider hourly rate ($15 to $100)
rating = np.random.uniform(3.5, 5.0, num_samples)           # Historical star rating (3.5 to 5.0)
total_reviews = np.random.randint(1, 150, num_samples)     # Experience volume (1 to 150 reviews)
is_verified = np.random.choice([0, 1], size=num_samples, p=[0.2, 0.8]) # 70% are background checked

# Applied conversion scoring formula (Log-Odds Equation)
# Lower distance, lower rates, higher ratings, more reviews, and verification improve scores
log_odds = (
    3.0 
    - (0.2 * distance) 
    - (0.01 * rate) 
    + (1.2 * (rating - 3.5)) 
    + (0.01 * total_reviews) 
    + (0.8 * is_verified)
)

# Pass the logs odds through a standard Sigmoid activation to compute probability bounds
probability = 1 / (1 + np.exp(-log_odds))

# Generate the true binary classification label (1 = Booked, 0 = Skipped)
booking_success = np.random.binomial(1, probability)

# Construct into a Pandas tabular grid
df = pd.DataFrame({
    'distance': distance,
    'rate': rate,
    'rating': rating,
    'total_reviews': total_reviews,
    'is_verified': is_verified,
    'booking_success': booking_success
})

# Save to disk as a tracking sheet
df.to_csv('mock_bookings.csv', index=False)
print(f"✅ Created {num_samples} rows in 'mock_bookings.csv' successfully.")