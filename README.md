# Full-Stack Retrieval-Augmented Generation (RAG) System

## Overview
A comprehensive, full-stack RAG application that allows users to upload documents (PDFs, TXTs, DOCXs) and intuitively query them using a conversational chat interface. The system leverages state-of-the-art Generative AI models from Google Gemini for embeddings and answer generation, paired with a robust Qdrant vector database for efficient retrieval.

## Architecture
- **Frontend**: Built with **Next.js (React 19)**, styled with **Tailwind CSS v4**, and enhanced with **Framer Motion** for smooth animations and a dynamic user experience.
- **Backend**: Built with **FastAPI (Python)**, providing high-performance RESTful APIs.
- **Vector Store**: **Qdrant** is used to store document embeddings and perform fast similarity searches.
- **LLM Engine**: Powered by **Google GenAI / Gemini API** (`gemini-1.5-flash` for chat formulation, `gemini-embedding-001` for embedding).
- **Processing**: Document extraction via `pypdf`, token-based text chunking using OpenAI's `tiktoken`.

## Features
- 📂 **Document Uploading**: Effortlessly upload multiple file types (`.pdf`, `.txt`, `.docx`) into the system.
- ✂️ **Smart Chunking**: Text is extracted, cleaned, and chunked by overlapping tokens to preserve context boundaries without word truncation.
- 🧠 **Embeddings Generation**: Document chunks are heavily vectorized using Google's generative AI embedding models.
- 🔍 **Vector Search Retrieval**: Similarity search utilizing Qdrant to find the most contextually relevant chunks for the user's query seamlessly.
- 💬 **Interactive Chat Interface**: A modern, aesthetically pleasing frontend application built to interact naturally with the ingested data knowledge base.
- 🐳 **Docker Support**: Containerized backend architecture ready for deployment.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Qdrant (can be run locally via Docker)
- A Google Gemini API Key

### Backend Setup
1. **Navigate to the Backend directory**:
   ```bash
   cd Backend
   ```
2. **Create a virtual environment & install dependencies**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `Backend` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_CHAT_MODEL=gemini-1.5-flash
   GEMINI_EMBED_MODEL=gemini-embedding-001
   QDRANT_URL=http://localhost:6333
   # Optional configurations:
   # QDRANT_API_KEY=
   # QDRANT_COLLECTION=pdf_chunks
   # CHUNK_SIZE_TOKENS=900
   # CHUNK_OVERLAP_TOKENS=150
   ```
4. **Start Qdrant**:
   You can run Qdrant using Docker easily:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```
5. **Run the API server**:
   ```bash
   uvicorn app.main:app --reload
   # Or using Docker: docker build -t rag-api . && docker run -p 8000:8000 rag-api
   ```
   *The backend will be available at `http://localhost:8000`.*

### Frontend Setup
1. **Navigate to the Frontend directory**:
   ```bash
   cd Frontend/temp-project
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the `temp-project` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:3000`.*

## System Endpoints (Backend)
- `GET /health` : Verify system status.
- `POST /api/v1/ingest/` : Upload a file (`.pdf`, `.txt`, `.docx`), extract text, generate chunks, calculate embeddings, and store them effectively into Qdrant.
- `POST /api/v1/query/` : Submits a query to search the vector database and subsequently generate a context-aware answer from the Gemini LLM.

## Directory Structure
```text
Rag_system/
├── Backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & endpoint definitions
│   │   ├── config.py            # Environment configurations
│   │   └── rag/                 # RAG logic (chunking, embeddings, pipeline, prompt)
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Docker configuration for API
│   └── .env                     # Secrets and configurations (not tracked)
└── Frontend/
    └── temp-project/
        ├── app/                 # Next.js App Router (pages: /upload, /chat)
        ├── components/          # Reusable UI components
        ├── lib/                 # Utility functions & API clients
        ├── package.json         # Node.js dependencies
        └── .env.local           # Frontend environment variables
```

## Technologies Used
- **Backend:** FastAPI, Python, PyPDF, TikToken, Uvicorn
- **AI/ML:** Google GenAI (Gemini) API
- **Vector Database:** Qdrant
- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Axios, Lucide React

## License
This project is licensed under the MIT License.
