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
5. Check if it's installed (Step 1)

---

## 2. PNPM

This project uses pnpm workspaces. Pick **one** of the two options below.

### Option A: Corepack (if available)

Some Node.js builds ship with corepack. Check if you have it:

```bash
corepack --version
```

- **If it prints a version:** Use corepack.

```bash
corepack enable
pnpm --version
```

If you get a different pnpm version:

```bash
corepack use pnpm@12.15.0
```

> **Windows Note:** If you encounter a permission error (`EPERM`), reopen PowerShell as **Administrator** and run `corepack enable` again.

> **Note:** `corepack enable` is a one-time setup. It persists across reboots.

### Option B: Global install via npm

```bash
npm install -g pnpm
pnpm --version
```

> **Windows Note:** Same as above — if you get `EPERM`, reopen PowerShell as **Administrator** and retry.

---

### Verify

Either option should give you:

```bash
pnpm --version
# 12.15.0
```

If `pnpm` is not recognized, your terminal PATH hasn't updated. Restart your terminal or VS Code.

---

## 3. Install

All commands run from the project root. No need to `cd` into subfolders.

```bash
# Clone (if you haven't already)
git clone https://github.com/VlahoErceg/FESB-MarketLink.git
cd FESB-MarketLink

# Install all workspace dependencies (backend + frontend)
pnpm install
```

---

## 4. Run

### Backend

```bash
pnpm dev:backend
```

The backend should now be running at **http://localhost:3000**.

### Frontend

```bash
pnpm dev:frontend
```

The frontend should now be running at **http://localhost:5173**.

### Both at once

```bash
pnpm dev:all
```

Starts the backend, waits for it to be ready, then starts the frontend. Both output in the same terminal.

### Verify

Go to your browser:

```
http://localhost:3000        ← backend
http://localhost:5173        ← frontend
```

Or from the terminal:

```bash
curl http://localhost:3000
```

Expected response:

```json
{
  "message": "Hello World!",
  "statusCode": 200
}
```

---

## 5. Useful Commands

All commands run from the project root.

| What | Command |
|---|---|
| Install all dependencies | `pnpm install` |
| Add a package to the backend | `pnpm add <pkg> --filter backend-api` |
| Add a dev package to the backend | `pnpm add -D <pkg> --filter backend-api` |
| Add a package to the frontend | `pnpm add <pkg> --filter marketlink-web` |
| Add a dev package to the frontend | `pnpm add -D <pkg> --filter marketlink-web` |
| Add a package to the workspace root | `pnpm add -w <pkg>` |
| Run the backend | `pnpm dev:backend` |
| Run the frontend | `pnpm dev:frontend` |
| Run both | `pnpm dev:all` |
| Run backend unit tests | `pnpm run test --filter backend-api` |
| Run backend e2e tests | `pnpm run test:e2e --filter backend-api` |
| Build the backend | `pnpm run build --filter backend-api` |
| Build the frontend | `pnpm run build --filter marketlink-web` |
| Lint the frontend | `pnpm run lint --filter marketlink-web` |
| Generate a NestJS resource | `pnpm nest g resource <name> --filter backend-api` |
| Generate a NestJS service | `pnpm nest g service <name> --filter backend-api` |

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| `pnpm: command not found` | Run `corepack enable`, restart your terminal |
| `EPERM` permission error (Windows) | Reopen PowerShell as **Administrator** and retry |
| `node: command not found` | Reinstall Node.js with "Add to PATH" checked, restart terminal |
| Port 3000 already in use | Close the other process |
| Port 5173 already in use | Close the other process |
| `nest: command not found` | Use `pnpm nest ... --filter backend-api` instead of bare `nest` |
| `Cannot find module 'class-validator'` | Run `pnpm add class-validator class-transformer --filter backend-api` from the root |
| TypeScript errors after clone | Make sure you ran `pnpm install` from the **root**, not from a subfolder |
| `corepack` not recognized | You're on Node < 16. Upgrade to Node 20+ LTS |
