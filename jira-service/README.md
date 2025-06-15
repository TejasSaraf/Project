# RAG Service for Jira Ticket Generation

This is a FastAPI-based microservice that handles the Retrieval-Augmented Generation (RAG) functionality for generating Jira tickets. The service uses OpenAI's GPT-4 model and ChromaDB for vector storage to generate contextually relevant Jira tickets based on user prompts.

## Features

- RAG-based Jira ticket generation
- Vector similarity search for context retrieval
- OpenAI GPT-4 integration
- RESTful API endpoints
- CORS support for Next.js frontend

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
```

4. Create a data directory for ChromaDB:
```bash
mkdir data
```

## Running the Service

Start the service with:
```bash
uvicorn app.main:app --reload
```

The service will be available at `http://localhost:8000`

## API Endpoints

### Generate Ticket
- **POST** `/generate-ticket`
- **Request Body**:
```json
{
    "prompt": "string",
    "context": ["string"] // optional
}
```
- **Response**:
```json
{
    "title": "string",
    "description": "string",
    "priority": "string",
    "labels": ["string"]
}
```

### Health Check
- **GET** `/health`
- **Response**:
```json
{
    "status": "healthy"
}
```

## API Documentation

Once the service is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 