import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_CALLBACK_URL;

  console.log("Environment check:", {
    clientId: !!clientId,
    redirectUri: !!redirectUri,
    actualClientId: clientId,
    actualRedirectUri: redirectUri,
  });

  if (!clientId || !redirectUri) {
    console.error("Missing required environment variables");
    return NextResponse.redirect(
      new URL("/dashboard?error=Jira configuration error", request.url)
    );
  }

  const state = crypto.randomBytes(16).toString("hex");

  (await cookies()).set("jira_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5,
    path: "/",
    sameSite: "lax",
  });

  const authParams = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: clientId,
    scope: "read:jira-work read:jira-user write:jira-work offline_access",
    redirect_uri: redirectUri,
    state: state,
    response_type: "code",
    prompt: "consent",
  });

  const authorizationUrl = `https://auth.atlassian.com/authorize?${authParams.toString()}`;

  return NextResponse.redirect(authorizationUrl);
}
