"""
AI Food Expiry Prediction Service

Uses a rule-based model to predict food freshness and risk levels
based on food type, storage conditions, temperature, and time since preparation.
"""
from datetime import datetime, timedelta

# Base shelf life in hours for different food types at room temperature
FOOD_TYPE_SHELF_LIFE = {
    'Cooked Rice': 6,
    'Cooked Vegetables': 8,
    'Curry': 8,
    'Bread': 48,
    'Fruits': 72,
    'Salad': 4,
    'Dairy': 4,
    'Dessert': 12,
    'Snacks': 24,
    'Beverages': 48,
    'Non-Veg Curry': 6,
    'Biryani': 6,
    'Roti/Chapati': 12,
    'Soup': 6,
    'Other': 8
}

# Storage type multipliers
STORAGE_MULTIPLIERS = {
    'Room Temperature': 1.0,
    'Refrigerated': 3.0,
    'Frozen': 10.0,
    'Insulated Container': 1.5,
    'Hot Case': 1.2
}

# Temperature impact (ambient temperature in Celsius)
def temperature_factor(temp_celsius):
    """Higher temperatures reduce shelf life."""
    if temp_celsius <= 4:
        return 3.0  # Refrigeration
    elif temp_celsius <= 15:
        return 2.0
    elif temp_celsius <= 25:
        return 1.0
    elif temp_celsius <= 35:
        return 0.7
    elif temp_celsius <= 45:
        return 0.4
    else:
        return 0.2


def predict_expiry(food_type, preparation_time, storage_type, temperature, pickup_time=None):
    """
    Predict food expiry based on input parameters.
    
    Args:
        food_type: Type of food (e.g., 'Cooked Rice', 'Bread')
        preparation_time: When the food was prepared (datetime or ISO string)
        storage_type: How the food is stored (e.g., 'Room Temperature', 'Refrigerated')
        temperature: Ambient temperature in Celsius (float)
        pickup_time: Expected pickup time (datetime or ISO string, optional)
    
    Returns:
        dict with freshness_score, predicted_expiry, risk_level, safe_hours_remaining, recommendation
    """
    # Parse times
    if isinstance(preparation_time, str):
        preparation_time = datetime.fromisoformat(preparation_time.replace('Z', '+00:00'))
    if isinstance(pickup_time, str) and pickup_time:
        pickup_time = datetime.fromisoformat(pickup_time.replace('Z', '+00:00'))
    
    now = datetime.utcnow()
    if preparation_time.tzinfo:
        from datetime import timezone
        now = datetime.now(timezone.utc)
    
    # Calculate base shelf life
    base_hours = FOOD_TYPE_SHELF_LIFE.get(food_type, 8)
    storage_mult = STORAGE_MULTIPLIERS.get(storage_type, 1.0)
    temp_factor = temperature_factor(temperature)
    
    effective_shelf_life_hours = base_hours * storage_mult * temp_factor
    
    # Calculate predicted expiry
    predicted_expiry = preparation_time + timedelta(hours=effective_shelf_life_hours)
    
    # Calculate freshness score (0-100)
    elapsed_hours = (now - preparation_time).total_seconds() / 3600
    if effective_shelf_life_hours > 0:
        freshness_ratio = max(0, 1 - (elapsed_hours / effective_shelf_life_hours))
    else:
        freshness_ratio = 0
    
    freshness_score = int(freshness_ratio * 100)
    freshness_score = max(0, min(100, freshness_score))
    
    # Calculate safe hours remaining
    safe_hours_remaining = max(0, (predicted_expiry - now).total_seconds() / 3600)
    
    # Determine risk level
    if freshness_score >= 70:
        risk_level = 'Green'
    elif freshness_score >= 40:
        risk_level = 'Yellow'
    else:
        risk_level = 'Red'
    
    # Check if pickup time is after predicted expiry
    recommendation = None
    if pickup_time and pickup_time > predicted_expiry:
        risk_level = 'Red'
        freshness_score = max(0, freshness_score - 20)
        recommendation = 'WARNING: Food may expire before pickup time. Consider prioritizing the nearest receiver for faster pickup.'
    elif risk_level == 'Red':
        recommendation = 'URGENT: Food freshness is critically low. Prioritize immediate pickup by the nearest available receiver.'
    elif risk_level == 'Yellow':
        recommendation = 'Food freshness is declining. Try to complete pickup within the next few hours.'
    
    return {
        'freshness_score': freshness_score,
        'predicted_expiry': predicted_expiry.isoformat(),
        'risk_level': risk_level,
        'safe_hours_remaining': round(safe_hours_remaining, 1),
        'effective_shelf_life_hours': round(effective_shelf_life_hours, 1),
        'recommendation': recommendation
    }
