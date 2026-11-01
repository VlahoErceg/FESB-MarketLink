# Project Setup

This document guides you through setting up the development environment for **FESB-MarketLink**.

---

## 1. Node.js Installation

Node.js is required to run the JavaScript/TypeScript runtime for the project.

### Step 1: Check if Node.js is already installed

Open your terminal (PowerShell, Command Prompt, or macOS Terminal) and run:

```bash
node -v
```

- **If a version number appears** (e.g., `v20.x.x` or higher): Node.js is already installed. You can proceed to Section 2.
- **If it returns `command not found` or an error:** Follow the installation steps below.

### Step 2: Download and Install

1. Go to the official [Node.js website](https://nodejs.org/).
2. Download the **LTS (Long Term Support)** installer for your operating system (Windows / macOS).
3. Run the installer and follow the prompt options (keep default settings checked, especially **"Add to PATH"**).
4. Restart your terminal or VS Code to apply system PATH updates.
5. Check if its installed (Step 1)

---

## 2. PNPM Global Installation

This project uses pnpm workspaces. Node 20+ ships with corepack, which manages pnpm for you — no global install needed.

### Step 1: Enable corepack (one-time)

```bash
corepack enable
```

### Step 2: Verify Installation

```bash
pnpm --version
```

If you get a different version or an error:

```bash
corepack use pnpm@12.15.0
```

> **Windows Note:** If you encounter a permission error (`EPERM`), close your terminal, reopen PowerShell as **Administrator** (Right-click → *Run as administrator*), and run the command again.

---

# Installing and Running the Backend

All commands run from the project root. No need to cd into subfolders.

```bash
# Clone (if you haven't already)
git clone <your-repo-url>
cd FESB-MarketLink

# Install all workspace dependencies (backend, frontend)
pnpm install

# Start the backend dev server
pnpm dev

```

The backend should now be running at http://localhost:3000.

### Step 2: Verify

Go to your browser at http://localhost:3000 or run:

```bash
curl http://localhost:3000
```

Expected response:

```bash
{
  "message": "Hello World!",
  "statusCode": 200
}

```

# Useful Commands
All commands run from the project root.

| What | Command |
|---|---|
| Install all dependencies | `pnpm install` |
| Add a package to the backend | `pnpm add <pkg> --filter backend-api` |
| Add a dev package to the backend | `pnpm add -D <pkg> --filter backend-api` |
| Run the backend | `pnpm dev` |
| Run backend unit tests | `pnpm run test --filter backend-api` |
| Run backend e2e tests | `pnpm run test:e2e --filter backend-api` |
| Build the backend | `pnpm run build --filter backend-api` |
| Generate a NestJS resource | `pnpm nest g resource <name> --filter backend-api` |
| Generate a NestJS service | `pnpm nest g service <name> --filter backend-api` |

