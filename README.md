# AgentGuard

AgentGuard is an AI-assisted security and transaction-monitoring
platform for autonomous agents. It combines rule-based risk evaluation,
behavioral analysis, trust scoring, security-event monitoring, audit
logging, and machine-learning anomaly detection in a single dashboard.

## Core capabilities

-   Agent registration and lifecycle/status monitoring
-   Transaction evaluation with ALLOW, REVIEW, and BLOCK decisions
-   Rule-based transaction risk scoring and explanations
-   Behavioral risk analysis for agents
-   Trust-score calculation
-   Security-event generation and monitoring
-   Audit-log generation for important actions
-   Machine-learning anomaly detection using Isolation Forest
-   ML score and label presentation in the dashboard
-   Transaction-level ML explanations
-   Dashboard summaries for agents, transactions, security events, and
    ML intelligence
-   Agent, transaction, security-event, and audit-log detail views

## Architecture

``` text
React + Vite Frontend
        |
        | HTTP / REST
        v
FastAPI Backend
        |
        +--> Transaction / Risk Services
        +--> Behavioral Analysis
        +--> Trust Scoring
        +--> ML Anomaly Detection
        +--> Security Monitoring
        +--> Audit Logging
        |
        v
SQLAlchemy / Database
```

The frontend consumes REST endpoints exposed by the FastAPI backend. The
backend owns transaction evaluation, risk calculations, behavioral
analysis, ML analysis, security events, and persistence.

## Machine Learning

AgentGuard uses an Isolation Forest based anomaly detector to identify
transaction amounts that are unusual relative to an agent's historical
behavior.

The ML layer exposes:

-   `ml_anomaly_detected`
-   `ml_score`
-   `ml_label`
-   `ml_reason`
-   `evaluated_at`

The ML result is presented alongside the existing rule-based risk
assessment rather than replacing it.

Example verified transaction:

-   Transaction: #36
-   Agent: #2
-   Amount: 9000
-   Decision: ALLOW
-   Risk score: 10
-   ML score: 47.44
-   ML label: MEDIUM
-   ML anomaly detected: false

## Important API endpoints

### Dashboard

``` text
GET /dashboard/overview
GET /dashboard/ml-summary
GET /dashboard/risk-summary
GET /dashboard/security-summary
GET /dashboard/high-risk-agents
GET /dashboard/risk-agents
GET /dashboard/recent-activity
```

### Transactions

``` text
GET /transactions
GET /transactions/{transaction_id}
```

### Security

``` text
GET /security-events
GET /security-events/{event_id}
GET /security-events/agent/{agent_id}
GET /security-monitoring
```

### Agents

Agent-specific routes provide agent details, behavioral analysis, trust
information, and anomaly information.

## Running locally

### Backend

From `backend`:

``` powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

``` text
http://127.0.0.1:8000
```

Swagger documentation:

``` text
http://127.0.0.1:8000/docs
```

### Frontend

From `frontend`:

``` powershell
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

Production build:

``` powershell
npm run build
```

## Verification completed

The project was tested through backend API checks and frontend E2E
checks.

Verified backend resources included:

-   2 agents
-   35 transactions before the final test transaction
-   18 security events
-   24 audit logs

A subsequent transaction #36 was also verified through the transaction
API and audit logging.

The frontend production build completed successfully with Vite.

## Project structure

``` text
AgentGuard/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── test_ml.py
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   └── ...
    └── package.json
```

## Git checkpoint

The completed ML integration and dashboard polish were checkpointed in
Git:

``` text
fa1f86a Complete AgentGuard ML integration and dashboard polish
```

The local branch was one commit ahead of `origin/main` at the time of
the checkpoint.


