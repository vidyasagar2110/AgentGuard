# AgentGuard Architecture

## 1. System overview

AgentGuard is organized into a frontend presentation layer and a FastAPI
backend service layer backed by a relational database.

``` text
+-----------------------------+
|       React / Vite UI       |
|-----------------------------|
| Dashboard                   |
| Transactions                |
| Transaction Details         |
| Agent Details               |
| Security Events             |
| Audit Logs                  |
+--------------+--------------+
               |
               | REST API
               v
+-----------------------------+
|       FastAPI Backend       |
|-----------------------------|
| Routes / API                |
| Schemas                     |
| Risk Aggregation            |
| Behavior Analysis           |
| Trust Scoring               |
| ML Anomaly Detection        |
| Security Monitoring         |
| Audit Logging               |
+--------------+--------------+
               |
               v
+-----------------------------+
| SQLAlchemy / Database       |
|-----------------------------|
| Agents                      |
| Transactions                |
| Security Events             |
| Audit Logs                  |
| ML transaction fields       |
+-----------------------------+
```

## 2. Transaction evaluation flow

``` text
Transaction submitted
        |
        v
Rule / policy evaluation
        |
        +----> Risk score + reasons
        |
        v
Behavioral analysis
        |
        +----> Agent behavioral risk
        |
        v
ML anomaly analysis
        |
        +----> ML score
        +----> ML label
        +----> anomaly flag
        +----> explanation
        |
        v
Final transaction record
        |
        +----> Security event when applicable
        +----> Audit log
        |
        v
Frontend dashboard / details
```

## 3. ML layer

The ML detector uses Isolation Forest to detect observations that are
statistically unusual compared with the agent's historical transaction
behavior.

The important design point is that ML is an additional intelligence
layer. It does not silently replace the existing policy/risk decision.

This allows the UI to distinguish:

-   rule-based decision
-   behavioral risk
-   ML anomaly assessment

That separation improves explainability.

## 4. Dashboard intelligence

The dashboard aggregates:

### Agent intelligence

-   Total agents
-   Active agents
-   Monitored agents
-   Restricted agents
-   Suspended agents

### Transaction intelligence

-   Total transactions
-   Allowed transactions
-   Review transactions
-   Blocked transactions

### Security intelligence

-   Total security events
-   High severity events
-   Medium severity events
-   Low severity events

### ML intelligence

-   Total transactions
-   ML-analyzed transactions
-   ML anomalies detected
-   High/medium/low ML labels
-   Average ML score
-   Latest anomaly information

## 5. Explainability

Transaction and agent pages expose the reasons behind risk decisions.

For ML analysis, the system stores an explanation such as whether
Isolation Forest identified the transaction amount as statistically
unusual relative to the agent's historical normal behavior.

The UI therefore communicates not only a score, but also the reason
behind the score.

## 6. Security monitoring

Security events capture security-relevant activity such as:

-   transaction blocking
-   transaction review
-   anomaly detection
-   severity classification

Audit logs separately record important actions such as transaction
evaluation.

Security monitoring can combine these activity sources for a
chronological operational view.

## 7. Trust and behavior

Behavior analysis calculates transaction statistics and behavioral
indicators including:

-   transaction count
-   allowed/review/blocked counts
-   non-blocked spending
-   average non-blocked transaction
-   maximum transaction
-   block rate
-   review rate
-   behavioral reasons

Trust scoring provides an additional agent-level signal for monitoring
decisions.

## 8. Design principles

### Explainable

Risk and ML outputs include human-readable reasons.

### Layered

Policy rules, behavioral analysis, trust scoring, and ML anomaly
detection are separate signals.

### Observable

Security events and audit logs provide traceability.

### Dashboard-driven

The most important signals are surfaced through summary cards and detail
pages.

### API-first

The frontend consumes backend REST APIs rather than duplicating business
logic.
