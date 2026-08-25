from typing import Optional

from openai import OpenAI

from app.config import settings


def _build_local_explanation(
    decision: str,
    risk_score: int,
    risk_factors: list[dict],
) -> str:
    """
    Generate a deterministic explanation without using an external API.

    The local engine only explains the signals produced by AgentGuard.
    It does not calculate or modify the risk score.
    """

    factor_count = len(risk_factors)

    if decision == "BLOCK":
        opening = (
            f"The transaction was blocked with a risk score of "
            f"{risk_score}."
        )

    elif decision == "REVIEW":
        opening = (
            f"The transaction requires additional review with a "
            f"risk score of {risk_score}."
        )

    else:
        opening = (
            f"The transaction was allowed with a risk score of "
            f"{risk_score}."
        )

    if not risk_factors:
        return (
            f"{opening} "
            "No additional risk factors were recorded."
        )

    high_count = sum(
        1
        for factor in risk_factors
        if factor.get("severity") == "HIGH"
    )

    medium_count = sum(
        1
        for factor in risk_factors
        if factor.get("severity") == "MEDIUM"
    )

    categories = {}

    for factor in risk_factors:
        factor_type = factor.get(
            "type",
            "RISK"
        )

        categories[factor_type] = (
            categories.get(factor_type, 0) + 1
        )

    category_summary = ", ".join(
        f"{count} {factor_type.lower()}"
        for factor_type, count in categories.items()
    )

    top_factors = [
        factor.get("message", "").rstrip(".")
        for factor in risk_factors
        if factor.get("message")
    ][:3]

    factor_text = ""

    if top_factors:
        factor_text = (
            " The strongest recorded signals were: "
            + "; ".join(top_factors)
            + "."
        )

    severity_text = ""

    if high_count and medium_count:
        severity_text = (
            f" The assessment contains {high_count} high-severity "
            f"and {medium_count} medium-severity signals."
        )

    elif high_count:
        severity_text = (
            f" The assessment contains {high_count} "
            "high-severity signal"
            + ("s." if high_count != 1 else ".")
        )

    elif medium_count:
        severity_text = (
            f" The assessment contains {medium_count} "
            "medium-severity signal"
            + ("s." if medium_count != 1 else ".")
        )

    return (
        f"{opening} "
        f"AgentGuard recorded {factor_count} risk factor"
        + ("s" if factor_count != 1 else "")
        + f" across {category_summary}."
        f"{severity_text}"
        f"{factor_text}"
    )


def _build_openai_explanation(
    decision: str,
    risk_score: int,
    risk_factors: list[dict],
) -> Optional[str]:
    """
    Generate an explanation using OpenAI.

    This is optional and only runs when explicitly configured.
    """

    if not settings.openai_api_key:
        return None

    client = OpenAI(
        api_key=settings.openai_api_key
    )

    factors_text = "\n".join(
        f"- [{factor.get('severity', 'UNKNOWN')}] "
        f"{factor.get('type', 'RISK')}: "
        f"{factor.get('message', '')}"
        for factor in risk_factors
    )

    prompt = f"""
You are the explainability component of AgentGuard,
a security platform for autonomous software agents.

Explain an already-determined transaction risk decision.

Decision: {decision}
Risk Score: {risk_score}

Risk Factors:
{factors_text}

Rules:
1. Do not change the decision.
2. Do not calculate a new risk score.
3. Do not invent facts.
4. Explain only the supplied risk factors.
5. Use clear professional language.
6. Keep the explanation between 2 and 4 sentences.
7. Clearly explain why the transaction received this decision.
"""

    response = client.responses.create(
        model=settings.openai_model,
        input=prompt,
    )

    explanation = response.output_text.strip()

    return explanation if explanation else None


def generate_ai_explanation(
    decision: str,
    risk_score: int,
    risk_factors: list[dict],
) -> Optional[str]:
    """
    Generate a transaction explanation.

    Supported providers:
    - local: deterministic local explainability
    - openai: OpenAI-powered explanation

    Local is the default so AgentGuard remains functional
    without external API quota.
    """

    provider = (
        settings.explainer_provider or "local"
    ).lower()

    if provider == "local":
        return _build_local_explanation(
            decision=decision,
            risk_score=risk_score,
            risk_factors=risk_factors,
        )

    if provider == "openai":
        try:
            explanation = _build_openai_explanation(
                decision=decision,
                risk_score=risk_score,
                risk_factors=risk_factors,
            )

            if explanation:
                return explanation

        except Exception as exc:
            print(
                "OpenAI explanation unavailable: "
                f"{type(exc).__name__}: {exc}"
            )

        # Automatic local fallback
        return _build_local_explanation(
            decision=decision,
            risk_score=risk_score,
            risk_factors=risk_factors,
        )

    return _build_local_explanation(
        decision=decision,
        risk_score=risk_score,
        risk_factors=risk_factors,
    )