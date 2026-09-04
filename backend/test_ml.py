from app.database import SessionLocal
from app.services.ml_anomaly_detector import detect_ml_anomaly


db = SessionLocal()

try:
    result = detect_ml_anomaly(
        db=db,
        agent_id=1,
        amount=10000,
    )

    print(result)

finally:
    db.close()