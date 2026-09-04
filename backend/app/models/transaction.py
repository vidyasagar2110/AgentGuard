from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    agent_id: Mapped[int] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    amount: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    decision: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    reasons: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # -----------------------------------------
    # MACHINE LEARNING ANOMALY DATA
    # -----------------------------------------

    ml_anomaly_detected: Mapped[bool] = mapped_column(
        nullable=False,
        default=False
    )

    ml_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    ml_label: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    ml_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # -----------------------------------------
    # TIMESTAMP
    # -----------------------------------------

    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )