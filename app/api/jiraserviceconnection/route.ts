import { NextResponse } from "next/server";

const RAG_SERVICE_URL =
  process.env.NEXT_PUBLIC_RAG_SERVICE_URL || "http://localhost:8000";
const RAG_SERVICE_API_KEY = process.env.RAG_SERVICE_API_KEY;

if (!RAG_SERVICE_API_KEY) {
  console.error("RAG_SERVICE_API_KEY is not set in environment variables");
}

export async function POST(request: Request) {
  try {
    if (!RAG_SERVICE_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: API key not set" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, context, project_key, access_token, jira_base_url } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Making request to RAG service:", {
      url: `${RAG_SERVICE_URL}/generate-ticket`,
      apiKey: RAG_SERVICE_API_KEY ? "***" : "not set",
    });

    const response = await fetch(`${RAG_SERVICE_URL}/generate-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": RAG_SERVICE_API_KEY,
      },
      body: JSON.stringify({
        prompt,
        context,
        project_key,
        access_token,
        jira_base_url,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to generate ticket",
      }));

      console.error("RAG service error:", {
        status: response.status,
        error: error.detail,
        body: error,
        url: RAG_SERVICE_URL,
      });

      return NextResponse.json(
        { error: error.detail || "Failed to generate ticket" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in RAG API route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
