# Recruit-AI — Smart Candidate Screening

AI-powered recruitment screening tool built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Single & Batch Screening** — Analyze one or multiple candidates against a job description
- **AI-Powered Analysis** — Match scoring, strength/concern identification, and hire recommendations via n8n workflows
- **Score Breakdown** — Skills match, experience, achievements, and soft skills scoring
- **History & Templates** — Save JD templates, track past analyses, export as CSV
- **PDF Export** — Professional screening reports
- **Workflow Status Tracking** — Email/scheduling notifications with visual timeline
- **Dark Mode** — Full light/dark theme support
- **Keyboard Shortcuts** — Ctrl+Enter to analyze, Escape to reset

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### Environment Variables

Copy the example env file and configure your API endpoints:

```sh
cp .env.example .env
```

Available variables:

| Variable | Description | Default |
|---|---|---|
| `VITE_N8N_WORKFLOW1_URL` | n8n Workflow 1 (Screening) webhook URL | `https://prabin-free-trial.app.n8n.cloud/webhook/recruit-ai-screening` |
| `VITE_N8N_WORKFLOW2_URL` | n8n Workflow 2 (Email/Scheduling) webhook URL | `https://prabin-free-trial.app.n8n.cloud/webhook/email-scheduling` |
| `VITE_DEFAULT_HIRING_MANAGER_EMAIL` | Default hiring manager email | `hr@company.com` |

### Development

```sh
npm run dev
```

### Build

```sh
npm run build
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State:** React hooks + localStorage persistence
- **API:** n8n webhooks with timeout + retry logic
- **PDF Parsing:** pdfjs-dist
- **Animations:** Tailwind CSS + CSS animations

## API Integration

The app communicates with two n8n workflows:

1. **Workflow 1 (Screening):** Accepts JD + resume, returns match score and analysis
2. **Workflow 2 (Email/Scheduling):** Sends interview invitations or rejection emails

See `src/lib/api-config.ts` for configuration details.

## Deployment

Open [Lovable](https://lovable.dev) and click **Share → Publish**.
