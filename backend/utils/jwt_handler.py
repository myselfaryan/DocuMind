import jwt
from datetime import datetime, timedelta
import os

SECRET = os.getenv("SECRET_KEY", "super-secret-key")

def create_token(user_id: int):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=2)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])
    except:
        return None
