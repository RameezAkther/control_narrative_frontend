# CTRL-INTEL: Frontend Interface

**Team GenIQ** | **Schneider University Hackathon**

This repository contains the frontend source code for **CTRL-INTEL**, an Autonomous Agentic AI Pipeline designed to extract, validate, and generate industrial control logic from unstructured narratives.

## Project Overview

CTRL-INTEL addresses the manual bottleneck in industrial automation engineering by automating the extraction of control logic from Control Narratives. The frontend serves as the user's command center, interacting with a Multi-Agent System (orchestrated by CrewAI and Gemini) to transform raw PDF documents into validated IEC 61131-3 Structured Text.

The interface is built to support a linear, dependency-based workflow where data flows from document ingestion to final code generation.

## Key Features

The frontend application provides the following capabilities:

**Document & Image Ingestion:**
* User-friendly upload interface for Control Narratives (PDF) and technical diagrams.
* Supports processing of "mixed-media" documents containing text, P&IDs, and tables.


**Real-Time Pipeline Tracking:**
* Visual status updates as the backend agents (Understanding, Logic, Loop Mapper, Validator, Code Gen) process the data.
* Transparency into the "Baton Pass" workflow, ensuring the user knows exactly which agent is currently active.


**Interactive Chat Assistant:**
* A built-in smart assistant for querying documentation.
* Supports multiple prompting strategies including **Simple RAG** (facts), **ReACT** (reasoning), and **FLARE** (complex generation).

**Results & Validation Display:**
* **Validation Reports:** View "Go/No-Go" gauges, issue registers, and safety warnings (e.g., missing interlocks).
* **Code Viewer:** Display and export the generated `5_plc_code.st` file, featuring standardized headers and logic blocks.

## Tech Stack

* **Framework:** React 
* **Styling:** Tailwind CSS 
* **API Integration:** Connects to a FastAPI backend 

## Getting Started
### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/ctrl-intel-frontend.git
cd ctrl-intel-frontend

```

2. **Install dependencies**
```bash
npm install

```

3. **Configure Environment**
Create a `.env` file in the root directory to point to your FastAPI backend (default is usually port 8000):
```env
VITE_API_BASE_URL=http://localhost:8000

```

4. **Run the Development Server**
```bash
npm run dev

```

The application will launch in your browser (typically at `http://localhost:5173`).

## 🔗 Backend Integration

This frontend is designed to work in tandem with the CTRL-INTEL backend. It communicates with the **Orchestration Layer** (pipeline script) to trigger the sequential data refinement pipeline.

**API Endpoints Handled:**

* **File Upload:** Sends documents to the **Ingestion Layer** (Document Ingestion Agent).

* **Progress Stream:** Subscribes to `update_progress` hooks to visualize the pipeline state.

* **Chat/RAG:** Sends user queries to the embedding store (ChromaDB) and retrieves context-aware answers.

## Contributors

**Team GenIQ** - Madras Institute of Technology, Anna University 

* **Rameez Akther M** (2022510025) 
* **Surya K S** (2022510022) 
* **Lavanya J** (2022510004) 
* **Sneha S** (2022510003) 

## Future Roadmap

Future updates to the frontend will include:

* **Human-in-the-Loop (HITL) Interface:** A "Review Mode" allowing engineers to edit logic and mapping JSONs before code generation.
---

*Based on the CTRL-INTEL Project Documentation by Team GenIQ.*