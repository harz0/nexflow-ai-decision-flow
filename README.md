# NexFlow – AI Decision Flow

NexFlow is an AI-powered visual workflow builder that allows users to create, connect, and execute decision-based workflows. It uses React Flow to design workflows, Inngest to execute durable AI decision steps, and Groq's LLM API to generate YES/NO decisions dynamically.

## Features

- **Visual Workflow Builder:** Create and connect decision nodes using React Flow.
- **AI-Powered Decisions:** Evaluate prompts using the Groq API.
- **Conditional Branching:** Follow YES or NO paths based on AI responses.
- **Inngest Integration:** Execute AI decision steps through Inngest functions.
- **Execution Visualization:** Track node execution status.
- **Execution Logs:** View workflow execution activity and results.
- **Save and Load:** Save workflows locally and restore them later.
- **JSON Import and Export:** Download workflows as JSON files and import them when needed.
- **Interactive Interface:** Edit prompts, rename nodes, connect branches, and manage workflows.

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend development |
| React Flow (`@xyflow/react`) | Visual workflow editor |
| Tailwind CSS | Styling |
| Shadcn UI | UI components |
| Node.js + Express | Backend API |
| Inngest | Workflow function execution |
| OpenAI SDK | LLM API integration |
| Groq API | AI decision generation |

## Project Structure

```text
nexflow-ai-decision-flow/
├── server/
│   ├── ai.js
│   ├── functions.js
│   ├── inngest.js
│   ├── index.js
│   └── results.js
├── src/
│   ├── components/
│   │   └── workflowcanvas.jsx
│   ├── App.jsx
│   └── index.css
├── .env
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Prerequisites

- Node.js and npm
- A Groq API key
- Inngest CLI

## Installation

1. Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

2. Navigate into the project directory:

```bash
cd flyrank-ai-decision-flow
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
INNGEST_DEV=1
```

Replace `your_groq_api_key` with your own Groq API key. Never commit your `.env` file.

## Running the Application

The application requires three running processes.

**Terminal 1 – Start the backend:**

```bash
node server/index.js
```

Backend runs at:

`http://localhost:3001`

**Terminal 2 – Start the Inngest Dev Server:**

```bash
npx inngest-cli@latest dev -u http://localhost:3001/api/inngest
```

Inngest dashboard:

`http://localhost:8288`

**Terminal 3 – Start the frontend:**

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## How It Works

1. Create decision nodes in the visual workflow editor.
2. Enter a prompt for each node.
3. Connect nodes using YES and NO branches.
4. Start workflow execution.
5. The frontend sends each decision request to the Express backend.
6. The backend sends an event to Inngest.
7. Inngest executes the AI decision step using the Groq API.
8. The returned YES/NO result determines the next branch.
9. Execution status and logs are displayed in the interface.

## Workflow Management

- Save and load workflows using local storage.
- Export workflows as JSON files.
- Import previously exported JSON workflows.
- Reset execution to run a workflow again.

## Security

- API keys are stored in environment variables.
- `.env` is excluded from version control.
- Users must provide their own Groq API key to run the application.

## Future Enhancements

- Persistent workflow storage using a database.
- Workflow execution history.
- Retry and recovery mechanisms.
- Advanced workflow analytics.
- Full server-side orchestration of multi-node workflows.

## Author

Developed as part of the FlyRank Backend AI Engineering Internship Assignment.