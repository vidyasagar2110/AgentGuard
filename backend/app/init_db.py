from app.database import Base, engine

from app.models.agent import Agent
from app.models.policy import AgentPolicy
from app.models.transaction import Transaction
from app.models.security_event import SecurityEvent
from app.models.audit_log import AuditLog


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully.")