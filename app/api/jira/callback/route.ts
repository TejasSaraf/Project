import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { db } from "app/components/lib/db";
import { encrypt } from "app/components/lib/encryption";
import { auth } from "app/configurations/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("Callback params:", {
    code: !!code,
    state: !!state,
    error,
    errorDescription,
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard?error=Jira integration failed", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard?error=No authorization code received", request.url)
    );
  }

  const storedState = (await cookies()).get("jira_oauth_state")?.value;

  (await cookies()).delete("jira_oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard?error=Security error during Jira integration",
        request.url
      )
    );
  }

  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;
  const redirectUri = process.env.JIRA_CALLBACK_URL;

  try {
    const session = await auth();
    console.log("Session check:", {
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
    });

    if (!session || !session.user?.id) {
      console.error("User not authenticated");
      return NextResponse.redirect(
        new URL("/auth/signin?error=JiraIntegrationRequiresLogin", request.url)
      );
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    console.log("Exchanging code for tokens...");
    const tokenResponse = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Token exchange successful");
    const { access_token, refresh_token, expires_in, scope } =
      tokenResponse.data;
    const accessTokenExpiry = new Date(Date.now() + expires_in * 1000);

    console.log("Fetching accessible resources...");
    const accessibleResourcesResponse = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log("Accessible resources:", accessibleResourcesResponse.data);

    const resources = accessibleResourcesResponse.data;
    if (!Array.isArray(resources) || resources.length === 0) {
      console.error("No accessible resources found");
      return NextResponse.redirect(
        new URL(
          "/dashboard?error=No accessible Jira resources found",
          request.url
        )
      );
    }

    const jiraCloudInstance = resources.find(
      (resource: any) =>
        resource.scopes && resource.scopes.includes("read:jira-work")
    );

    if (!jiraCloudInstance) {
      console.error("No Jira Cloud instance found with required scopes");
      console.log(
        "Available resources:",
        resources.map((r) => ({ id: r.id, name: r.name, scopes: r.scopes }))
      );
      return NextResponse.redirect(
        new URL(
          "/dashboard?error=No Jira Cloud instance found with required permissions",
          request.url
        )
      );
    }

    const cloudId = jiraCloudInstance.id;
    const jiraBaseUrl = jiraCloudInstance.url;

    console.log("Jira instance found:", { cloudId, jiraBaseUrl });

    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = encrypt(refresh_token);

    console.log("Saving integration to database...");
    await db.userJiraIntegration.upsert({
      where: {
        userId_jiraCloudId: {
          userId: userId,
          jiraCloudId: cloudId,
        },
      },
      update: {
        jiraBaseUrl: jiraBaseUrl,
        encryptedAccessToken: encryptedAccessToken,
        accessTokenExpiresAt: accessTokenExpiry,
        encryptedRefreshToken: encryptedRefreshToken,
        scopes: scope,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        jiraCloudId: cloudId,
        jiraBaseUrl: jiraBaseUrl,
        encryptedAccessToken: encryptedAccessToken,
        accessTokenExpiresAt: accessTokenExpiry,
        encryptedRefreshToken: encryptedRefreshToken,
        scopes: scope,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard?success=Jira integration successful!", request.url)
    );
  } catch (err: any) {
    console.error("=== Error during Jira OAuth callback ===");
    console.error("Error type:", err.constructor.name);
    console.error("Error message:", err.message);

    if (err.response) {
      console.error("HTTP Status:", err.response.status);
      console.error("Response data:", err.response.data);
      console.error("Response headers:", err.response.headers);
    }

    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }

    let errorMessage = "Failed to integrate Jira. Please try again.";

    if (err.response?.status === 400) {
      errorMessage =
        "Invalid request to Jira. Please check your configuration.";
    } else if (err.response?.status === 401) {
      errorMessage = "Authentication failed with Jira. Please try again.";
    } else if (err.code === "ECONNREFUSED") {
      errorMessage =
        "Could not connect to Jira. Please check your network connection.";
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
