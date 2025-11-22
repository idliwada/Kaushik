# Nexus CRM

A high-performance Personal CRM focusing on relationship health, pipeline management, and AI-driven insights.

## 🚀 How to Run Locally

This project is a React application configured with Vite.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Setup
Clone the repository and install dependencies:

```bash
npm install
```

### 2. API Key Configuration
Create a `.env` file in the root directory of the project to store your Google GenAI API Key.

```env
API_KEY=your_actual_api_key_here
```

> **Note:** You can get an API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Run Development Server
Start the local development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

## 🛠 Tech Stack
- **React** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Google GenAI SDK** - AI Features (Data Enrichment, Smart Drafting)
- **Recharts** - Data Visualization
- **Lucide React** - Icons

## 📦 Deployment
This app is ready to be deployed to platforms like Netlify, Vercel, or GitHub Pages.

**Build Command:**
```bash
npm run build
```

**Output Directory:**
`dist`
