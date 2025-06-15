import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "app/components/lib/db";
import { decrypt } from "app/components/lib/encryption";
import { auth } from "app/configurations/auth";

async function getJiraIntegrationForUser(userId: string) {
  return db.userJiraIntegration.findFirst({
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
  });
}

async function refreshJiraAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
) {
  try {
    const response = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error refreshing Jira token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to refresh Jira access token.");
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectKey = searchParams.get("projectKey");

  if (!projectKey) {
    return NextResponse.json(
      { message: "Project key is required" },
      { status: 400 }
    );
  }

  try {
    const jiraIntegration = await getJiraIntegrationForUser(session.user.id);

    if (!jiraIntegration) {
      return NextResponse.json(
        { message: "Jira not integrated for this user." },
        { status: 400 }
      );
    }

    let {
      encryptedAccessToken,
      encryptedRefreshToken,
      jiraCloudId: cloudId,
      accessTokenExpiresAt,
    } = jiraIntegration;
    let accessToken = decrypt(encryptedAccessToken);
    const refreshToken = decrypt(encryptedRefreshToken);

    if (new Date() >= accessTokenExpiresAt) {
      const newTokens = await refreshJiraAccessToken(
        process.env.JIRA_CLIENT_ID!,
        process.env.JIRA_CLIENT_SECRET!,
        refreshToken
      );

      accessToken = newTokens.access_token;
      const newAccessTokenExpiry = new Date(
        Date.now() + newTokens.expires_in * 1000
      );

      await db.userJiraIntegration.update({
        where: {
          userId_jiraCloudId: {
            userId: session.user.id,
            jiraCloudId: cloudId,
          },
        },
        data: {
          encryptedAccessToken: newTokens.access_token,
          encryptedRefreshToken: newTokens.refresh_token,
          accessTokenExpiresAt: newAccessTokenExpiry,
          updatedAt: new Date(),
        },
      });
    }

    const issuesResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: {
          jql: `project = ${projectKey}`,
          maxResults: 50,
          fields: "summary,description,status,assignee,priority",
        },
      }
    );

    return NextResponse.json(issuesResponse.data);
  } catch (err: any) {
    console.error(
      "Error fetching Jira issues:",
      err.response ? err.response.data : err.message
    );
    if (err.response && err.response.status === 401) {
      return NextResponse.json(
        {
          message:
            "Jira access token invalid or revoked. Please reconnect Jira.",
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to fetch Jira issues." },
      { status: 500 }
    );
  }
}
