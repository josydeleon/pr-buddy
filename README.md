# PR Buddy

**PR Buddy is a lightweight tool designed to improve code review quality through guided, consistent PR evaluations.** It helps developers and teams conduct more thorough and structured code reviews by leveraging AI-assisted suggestions and a clear, actionable interface.

## Overview

Reviewing pull requests is a critical part of the software development lifecycle, but it can be time-consuming and prone to inconsistency. PR Buddy solves this by providing a focused environment to analyze PRs, generate high-quality feedback with the help of AI, and ensure that every review is comprehensive. It streamlines the process, saving developers time and elevating the quality of the codebase.

## Features

- **AI-Powered Insights:** Integrates with Anthropic Claude to provide deep, contextual analysis of pull requests, suggesting improvements, identifying potential bugs, and generating review comments.
- **Structured Feedback:** Guides reviewers to provide consistent and actionable feedback.
- **GitHub Integration:** Seamlessly connects with your GitHub repositories to fetch PRs, analyze diffs, and post comments directly from the tool.
- **Cross-Platform Compatibility:** Functions as a standalone desktop application using Electron, and can also be run in a web browser.
- **Customizable Prompts:** Allows you to tailor the AI's system prompt to match your team's specific coding standards and review focus.

## Architecture

PR Buddy uses a hybrid architecture composed of a frontend application and a local backend server.

- **Frontend:** The user interface is built with **React** and can be run in two modes:
    1.  **Desktop App:** Packaged with **Electron** for a native desktop experience.
    2.  **Web App:** Can be run in any modern web browser.
- **Backend:** A local **Node.js** server using **Express** acts as a bridge to the Anthropic Claude API. This server is responsible for securely handling the AI API key and processing analysis requests from the frontend.

### Component Interaction

```
+-----------------+      +---------------------+      +----------------------+
|  Electron/Browser |      |   Local Node.js   |      |   External APIs    |
|     (Frontend)    |      | (Backend on PORT) |      | (GitHub, Anthropic)  |
+-----------------+      +---------------------+      +----------------------+
        |                      |                      |
        |---(Fetch PRs, Post Review)---> (GitHub API)  |
        |                      |                      |
        |<--(PR Data, Auth Success)---- (GitHub API)  |
        |                      |                      |
        |---(Analyze PR Request)--->|                      |
        |                      |---(AI API Call)----> (Anthropic API)|
        |                      |<--(AI Response)------ (Anthropic API)|
        |<--(Analysis Result)-------|                      |
        |                      |                      |
```

## Installation

### Prerequisites

-   **Node.js:** `v18.x` or later
-   **npm:** `v9.x` or later (or `yarn`)

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/pr-buddy.git
    cd pr-buddy
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## Configuration

The application requires environment variables to connect to external services. A template is provided in the `.env.example` file.

1.  **Create a `.env` file:**
    Copy the example file to a new `.env` file in the root of the project.
    ```bash
    cp .env.example .env
    ```

2.  **Configure Variables:**
    Open the new `.env` file and replace the placeholder values with your actual credentials.

    -   **GitHub Token:**
        You need a GitHub Personal Access Token with the following scopes:
        -   `repo` (full control of private repositories)
        -   `read:user` (to read user profile data)
        ```
        VITE_GITHUB_TOKEN=your_github_personal_access_token
        ```

    -   **Anthropic Claude API Key:**
        Obtain an API key from [Anthropic](https://console.anthropic.com/dashboard).
        ```
        VITE_ANTHROPIC_API_KEY=your_claude_api_key
        ```

    -   **Server Port (Optional):**
        Configure the port for the internal Node.js server. Defaults to `3000`.
        ```
        SERVER_PORT=3000
        ```

> **Note:** The `.env` file contains sensitive credentials and should **never** be committed to version control. It is included in the `.gitignore` file by default to prevent this.

## Usage

### Running the Application

You can run PR Buddy as a desktop app or in the browser.

-   **Run in Development Mode (Browser & Electron):**
    This command starts the Vite dev server for the frontend and the Node.js server concurrently.
    ```bash
    npm run dev
    ```

-   **Build for Production:**
    To build the application for production, including the Electron executable:
    ```bash
    npm run electron:build
    ```

### Basic Workflow

1.  Launch the application.
2.  The app will use the `VITE_GITHUB_TOKEN` from your `.env` file. If not present, it will prompt you to enter one.
3.  Select a repository from the list to view its open pull requests.
4.  Click on a pull request to view its details and diff.
5.  Click the "Analyze PR" button to get an AI-assisted review.
6.  Review the suggestions and post feedback to GitHub.

## Troubleshooting

**API tokens are not working after updating the `.env` file:**

If you update your GitHub or Anthropic tokens and the application doesn't seem to recognize the new values, the old token may be cached in the application's local storage.

To resolve this, navigate to the application's settings (gear icon) and use the **"Clear Cache"** or **"Reset Application Data"** option. This will clear all stored data, forcing the application to re-load the new tokens from the `.env` file upon restart.

## Contributing

Contributions are welcome and encouraged! Please feel free to open an issue or submit a pull request. For more detailed guidelines, please see the `CONTRIBUTING.md` file (coming soon).

## License

This project is licensed under the MIT License.

## Technologies Used

-   **Core:** Electron, React, Node.js, Express.js, TypeScript
-   **APIs:** @octokit/rest (GitHub), @anthropic-ai/sdk (Claude)
-   **Frontend:** Vite, Tailwind CSS, Zustand, TanStack Query, Lucide React
-   **Backend:** Express.js
-   **Tooling:** ESLint, Prettier
