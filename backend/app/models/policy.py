from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AgentPolicy(Base):
    __tablename__ = "agent_policies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    agent_id: Mapped[int] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    max_transaction_amount: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    daily_spending_limit: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    approval_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    allowed_categories: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    blocked_categories: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    agent = relationship(
        "Agent",
        backref="policy",
        uselist=False
    )