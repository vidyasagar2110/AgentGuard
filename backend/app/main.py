from fastapi import FastAPI

from app.routes.agents import router as agents_router


app = FastAPI(
    title="AgentGuard API",
    description="AI Risk and Policy Manager for Agentic Payments",
    version="0.1.0"
)

app.include_router(agents_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgentGuard API",
        "version": "0.1.0"
    }