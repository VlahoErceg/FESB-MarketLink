# Installing Node.js and PNPM

This document guides you through setting up Node.js and pnpm on your system.

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

---

## 2. PNPM Global Installation

`pnpm` is the primary package manager used in this repository.

### Step 1: Check if pnpm is installed

Run:

```bash
pnpm --version
```

- **If a version prints out:** `pnpm` is ready to use!
- **If it returns an error or `command not found`:** Proceed to Step 2.

### Step 2: Install pnpm Globally via npm

Open your terminal and run the global install command:

```bash
npm install -g pnpm
```

> **Windows Note:** If you encounter a permission error (`EPERM`), close your terminal, reopen PowerShell as **Administrator** (Right-click → *Run as administrator*), and run the command again.

### Step 3: Verify Installation

Confirm that the installation was successful by checking the version:

```bash
pnpm --version
```

---

# Running the Backend

### Step 1: Navigate to the Backend Directory

From the project root, change into the backend API folder:

```bash
cd backend/backend-api
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Start the Server

```bash
pnpm run start:dev
```

The development server should now be running. Open your browser to the URL shown in the terminal to confirm everything is working.
