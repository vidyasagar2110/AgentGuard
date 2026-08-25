import json
import sys
from pathlib import Path

import requests


API_BASE_URL = "http://127.0.0.1:8000"

AGENT_ID = 2


SCENARIOS = {
    "normal": [
        {
            "amount": 1000,
            "category": "Cloud",
        },
        {
            "amount": 1500,
            "category": "Cloud",
        },
        {
            "amount": 2000,
            "category": "Cloud",
        },
    ],

    "suspicious": [
        {
            "amount": 5000,
            "category": "Cloud",
        },
        {
            "amount": 8000,
            "category": "Cloud",
        },
        {
            "amount": 15000,
            "category": "Cloud",
        },
        {
            "amount": 20000,
            "category": "Cloud",
        },
    ],

    "high_risk": [
        {
            "amount": 50000,
            "category": "Gambling",
        },
        {
            "amount": 50000,
            "category": "gambling",
        },
    ],
}


def evaluate_transaction(
    agent_id: int,
    amount: int,
    category: str,
) -> dict:

    response = requests.post(
        f"{API_BASE_URL}/transactions/evaluate",
        json={
            "agent_id": agent_id,
            "amount": amount,
            "category": category,
        },
        timeout=10,
    )

    response.raise_for_status()

    return response.json()


def print_result(
    scenario: str,
    transaction: dict,
):
    print()
    print("=" * 65)
    print(f"SCENARIO: {scenario.upper()}")
    print("=" * 65)

    print(
        f"Transaction ID : {transaction['id']}"
    )

    print(
        f"Amount         : ₹{transaction['amount']:,}"
    )

    print(
        f"Category       : {transaction['category']}"
    )

    print(
        f"Decision       : {transaction['decision']}"
    )

    print(
        f"Risk Score     : {transaction['risk_score']}"
    )

    reasons = transaction.get(
        "reasons",
        []
    )

    if reasons:

        print("Risk Factors:")

        for reason in reasons:
            print(f"  - {reason}")

    else:

        print("Risk Factors   : None")


def run_scenario(
    scenario_name: str,
):
    transactions = SCENARIOS[
        scenario_name
    ]

    print()
    print(
        f"Running {scenario_name} scenario..."
    )

    results = []

    for transaction in transactions:

        try:

            result = evaluate_transaction(
                agent_id=AGENT_ID,
                amount=transaction["amount"],
                category=transaction["category"],
            )

            results.append(result)

            print_result(
                scenario_name,
                result,
            )

        except requests.HTTPError as error:

            print(
                f"Transaction failed: {error}"
            )

            if error.response is not None:
                print(
                    error.response.text
                )

        except requests.RequestException as error:

            print(
                f"API connection failed: {error}"
            )

    return results


def main():

    if len(sys.argv) > 1:

        scenario = sys.argv[1].lower()

        if scenario not in SCENARIOS:

            print(
                "Invalid scenario."
            )

            print(
                "Available scenarios:"
            )

            for name in SCENARIOS:
                print(
                    f"  - {name}"
                )

            sys.exit(1)

        run_scenario(
            scenario
        )

        return

    print()
    print("AgentGuard Agent Simulator")
    print()
    print("Available scenarios:")
    print("  1. normal")
    print("  2. suspicious")
    print("  3. high_risk")
    print()
    print(
        "Example:"
    )
    print(
        "python backend/simulation/"
        "agent_simulator.py suspicious"
    )


if __name__ == "__main__":
    main()