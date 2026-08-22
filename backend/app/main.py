from fastapi import FastAPI

from app.routes.agents import router as agents_router
from app.routes.policies import router as policies_router
from app.routes.transactions import router as transactions_router
from app.routes.transaction_history import (
    router as transaction_history_router
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


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgentGuard API",
        "version": "0.3.0"
    }