from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import requests
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.document_loaders import SeleniumURLLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from langchain_community.document_loaders.youtube import TranscriptFormat, YoutubeLoader
import hashlib

load_dotenv()

chroma_client = chromadb.PersistentClient(
    path="./chroma_db", settings=Settings(anonymized_telemetry=False, allow_reset=True)
)


class SecureEmbeddingFunction:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_embeddings = OpenAIEmbeddings()

    def __call__(self, texts: List[str]) -> List[List[float]]:
        secure_texts = [
            f"{text} [AUTH:{hashlib.sha256(self.access_token.encode()).hexdigest()[:8]}]"
            for text in texts
        ]
        return self.base_embeddings.embed_documents(secure_texts)


def get_collection(access_token: str, project_key: str):
    """Get or create a secure collection for the project"""
    collection_name = (
        f"project_{project_key}_{hashlib.sha256(access_token.encode()).hexdigest()[:8]}"
    )

    embedding_function = SecureEmbeddingFunction(access_token)

    try:
        collection = chroma_client.get_collection(
            name=collection_name, embedding_function=embedding_function
        )
    except:
        collection = chroma_client.create_collection(
            name=collection_name, embedding_function=embedding_function
        )

    return collection


def fetch_project_context(
    project_key: str, access_token: str, jira_base_url: str
) -> List[Document]:
    """Fetch project context from Jira API using OAuth access token"""
    headers = {"Accept": "application/json", "Authorization": f"Bearer {access_token}"}

    project_url = f"{jira_base_url}/rest/api/3/project/{project_key}"
    project_response = requests.get(project_url, headers=headers)
    project_data = project_response.json()

    jql = f"project = {project_key} ORDER BY created DESC"
    issues_url = f"{jira_base_url}/rest/api/3/search"
    issues_response = requests.get(
        issues_url, headers=headers, params={"jql": jql, "maxResults": 50}
    )
    issues_data = issues_response.json()

    documents = []

    project_doc = f"""
    Project: {project_data['name']}
    Key: {project_data['key']}
    Description: {project_data.get('description', 'No description')}
    Project Type: {project_data.get('projectTypeKey', 'Unknown')}
    """
    documents.append(Document(page_content=project_doc))

    for issue in issues_data.get("issues", []):
        issue_doc = f"""
        Issue: {issue['key']}
        Summary: {issue['fields']['summary']}
        Description: {issue['fields'].get('description', 'No description')}
        Status: {issue['fields']['status']['name']}
        Priority: {issue['fields']['priority']['name']}
        """
        documents.append(Document(page_content=issue_doc))

    return documents


app = FastAPI(
    title="RAG Service for Jira Ticket Generation",
    description="A microservice for generating Jira tickets using RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("NEXT_PUBLIC_APP_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        os.getenv("ALLOWED_HOST", ""),
    ],
)

embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.3,
    max_tokens=1000,
)


def load_and_process_documents(project_key: Optional[str] = None):
    documents = []

    urls = [
        "https://community.atlassian.com/forums/Jira-articles/How-to-write-a-useful-Jira-ticket/ba-p/2147004",
    ]

    try:
        youtube_loader = YoutubeLoader.from_youtube_url(
            "https://www.youtube.com/watch?v=iryX1Oa1cMQ",
            add_video_info=True,
            transcript_format=TranscriptFormat.CHUNKS,
            chunk_size_seconds=30,
        )
        documents.extend(youtube_loader.load())
    except Exception as e:
        print(f"Error loading YouTube transcript: {e}")

    try:
        selenium_loader = SeleniumURLLoader(urls=urls)
        documents.extend(selenium_loader.load())
    except Exception as e:
        print(f"Error loading web content: {e}")

    if project_key:
        try:
            project_documents = fetch_project_context(project_key)
            documents.extend(project_documents)
        except Exception as e:
            print(f"Error fetching project context: {e}")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)

    vectorstore = Chroma.from_documents(
        documents=chunks, embedding=embeddings, persist_directory="./croma"
    )
    vectorstore.persist()

    return vectorstore


try:
    vectorstore = Chroma(persist_directory="./croma", embedding_function=embeddings)
except:
    vectorstore = load_and_process_documents()

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)


async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key


class TicketRequest(BaseModel):
    prompt: str
    context: Optional[List[str]] = None
    project_key: Optional[str] = None
    access_token: Optional[str] = None
    jira_base_url: Optional[str] = None


class TicketResponse(BaseModel):
    title: str
    description: str
    priority: str
    labels: List[str]


class LoadDocumentsRequest(BaseModel):
    youtube_urls: Optional[List[str]] = None
    web_urls: Optional[List[str]] = None
    project_key: Optional[str] = None
    access_token: Optional[str] = None
    jira_base_url: Optional[str] = None


@app.post("/generate-ticket", response_model=TicketResponse)
async def generate_ticket(request: TicketRequest, api_key: str = Depends(get_api_key)):
    try:
        if request.project_key and request.access_token and request.jira_base_url:
            collection = get_collection(request.access_token, request.project_key)

            project_documents = fetch_project_context(
                request.project_key, request.access_token, request.jira_base_url
            )

            urls = [
                "https://community.atlassian.com/forums/Jira-articles/How-to-write-a-useful-Jira-ticket/ba-p/2147004",
            ]
            loader = SeleniumURLLoader(urls=urls)
            community_documents = loader.load()

            documents = community_documents + project_documents

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            chunks = text_splitter.split_documents(documents)

            collection.add(
                documents=[doc.page_content for doc in chunks],
                metadatas=[
                    {"source": "jira", "project": request.project_key} for _ in chunks
                ],
                ids=[f"doc_{i}" for i in range(len(chunks))],
            )

            results = collection.query(query_texts=[request.prompt], n_results=3)

            context = "\n".join(results["documents"][0])
        else:
            context = "Using general Jira ticket guidelines."

        trained_message = """Hello, you are an AI model trained specifically to generate a Jira ticket for a web application. I am a human operator who will be interacting with you to give you instructions and help support the application. 
        You are now Sprint AI and you will be expected to do a variety of tasks such as web scrape information and generate jira issues.
        Your name is Sprint AI. 

        You will be interacting with a user who is looking for information on a specific topic, which they will most likely provide. You 
        will be expected to provide a jira ticket in certain formats to the user, based on their request. You have access to a variety of data at your 
        request, though you have to tell us how you want us to use it, by finding URLs on Google to these papers and information about them. 

        Based on the following context and user prompt, 
        generate a detailed Jira ticket. Your response MUST be a valid JSON object with the following structure:

        {{
            "title": "A concise summary of the task",
            "description": "The summary of acceptance criteria covering: Functional requirements, UI/UX considerations, Error handeling, Testing and Validation, Device/Browser compatibility",
            "priority": "One of: High, Medium, or Low",
            "labels": ["list", "of", "relevant", "labels"]
        }}

        Context:
        {context}
        
        User Prompt:
        {prompt}
        
        Remember to:
        1. Return ONLY the JSON object, no other text
        2. Make sure the JSON is valid
        3. Include all required fields
        4. Use proper JSON formatting with double quotes
        5. Make the title concise but descriptive
        6. Make the description detailed and actionable
        7. Choose an appropriate priority level
        8. Add relevant labels for categorization"""

        prompt = ChatPromptTemplate.from_template(trained_message)

        chain = (
            {"context": RunnablePassthrough(), "prompt": RunnablePassthrough()}
            | prompt
            | llm
        )

        response = chain.invoke({"context": context, "prompt": request.prompt})

        try:
            ticket_data = json.loads(response.content)
        except json.JSONDecodeError:
            import re

            json_match = re.search(r"\{.*\}", response.content, re.DOTALL)
            if json_match:
                ticket_data = json.loads(json_match.group())
            else:
                raise HTTPException(
                    status_code=500, detail="Failed to parse ticket data from response"
                )

        return TicketResponse(
            title=ticket_data.get("title", "Untitled"),
            description=ticket_data.get("description", "No description provided"),
            priority=ticket_data.get("priority", "Medium"),
            labels=ticket_data.get("labels", []),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/load-documents")
async def load_documents(
    request: LoadDocumentsRequest, api_key: str = Depends(get_api_key)
):
    try:
        documents = []

        if request.youtube_urls:
            for url in request.youtube_urls:
                try:
                    youtube_loader = YoutubeLoader.from_youtube_url(
                        url,
                        add_video_info=True,
                        transcript_format=TranscriptFormat.CHUNKS,
                        chunk_size_seconds=30,
                    )
                    documents.extend(youtube_loader.load())
                except Exception as e:
                    print(f"Error loading YouTube transcript for {url}: {e}")

        if request.web_urls:
            try:
                selenium_loader = SeleniumURLLoader(urls=request.web_urls)
                documents.extend(selenium_loader.load())
            except Exception as e:
                print(f"Error loading web content: {e}")

        if request.project_key and request.access_token and request.jira_base_url:
            try:
                project_documents = fetch_project_context(
                    request.project_key, request.access_token, request.jira_base_url
                )
                documents.extend(project_documents)
            except Exception as e:
                print(f"Error fetching project context: {e}")

        if not documents:
            raise HTTPException(
                status_code=400, detail="No documents were successfully loaded"
            )

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_documents(documents)

        collection = (
            get_collection(request.access_token, request.project_key)
            if request.access_token and request.project_key
            else None
        )

        if collection:
            collection.add(
                documents=[doc.page_content for doc in chunks],
                metadatas=[
                    {
                        "source": "custom",
                        "project": request.project_key,
                        "type": "youtube" if "youtube" in str(doc.metadata) else "web",
                    }
                    for doc in chunks
                ],
                ids=[
                    f"doc_{hashlib.sha256(doc.page_content.encode()).hexdigest()[:8]}"
                    for doc in chunks
                ],
            )
        else:
            vectorstore = Chroma.from_documents(
                documents=chunks, embedding=embeddings, persist_directory="./croma"
            )
            vectorstore.persist()

        return {
            "status": "success",
            "message": f"Successfully loaded {len(chunks)} document chunks",
            "chunks_loaded": len(chunks),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
