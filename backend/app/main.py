from fastapi import FastAPI

from app.routes.agents import router as agents_router
from app.routes.policies import router as policies_router
from app.routes.transactions import router as transactions_router
from app.routes.transaction_history import (
    router as transaction_history_router
)
from app.routes.behavior import router as behavior_router
from app.routes.anomalies import router as anomalies_router
from app.routes.risk import router as risk_router
from app.routes.dashboard import router as dashboard_router
from app.routes.trust import router as trust_router
from app.routes.profile import router as profile_router
from app.routes.security_events import router as security_events_router
from app.routes.audit_logs import router as audit_logs_router
from app.routes.security_monitoring import (
    router as security_monitoring_router
)

app = FastAPI(
    title="AgentGuard API",
    description="AI Risk and Policy Manager for Agentic Payments",
    version="0.3.0"
)

app.include_router(agents_router)
app.include_router(policies_router)
app.include_router(transactions_router)
app.include_router(transaction_history_router)
app.include_router(behavior_router)
app.include_router(anomalies_router)
app.include_router(risk_router)
app.include_router(dashboard_router)
app.include_router(trust_router)
app.include_router(profile_router)
app.include_router(security_events_router)
app.include_router(audit_logs_router)
app.include_router(security_monitoring_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgentGuard API",
        "version": "0.3.0"
    }