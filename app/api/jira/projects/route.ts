import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "app/components/lib/db";
import { encrypt, decrypt } from "app/components/lib/encryption";
import { auth } from "app/configurations/auth";
import type { UserJiraIntegration } from "@prisma/client";

async function getJiraIntegrationForUser(
  userId: string
): Promise<UserJiraIntegration | null> {
  return db.userJiraIntegration.findFirst({
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
  });
}

async function updateJiraTokensInDatabase(
  userId: string,
  cloudId: string,
  data: { access_token: string; refresh_token: string; accessTokenExpiry: Date }
) {
  await db.userJiraIntegration.update({
    where: {
      userId_jiraCloudId: {
        userId: userId,
        jiraCloudId: cloudId,
      },
    },
    data: {
      encryptedAccessToken: data.access_token,
      encryptedRefreshToken: data.refresh_token,
      accessTokenExpiresAt: data.accessTokenExpiry,
      updatedAt: new Date(),
    },
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
  const userId = session.user.id;

  try {
    const jiraIntegration = await getJiraIntegrationForUser(userId);

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
      console.log("Access token expired, refreshing...");
      const newTokens = await refreshJiraAccessToken(
        process.env.JIRA_CLIENT_ID!,
        process.env.JIRA_CLIENT_SECRET!,
        refreshToken
      );

      accessToken = newTokens.access_token;
      const newAccessTokenExpiry = new Date(
        Date.now() + newTokens.expires_in * 1000
      );

      await updateJiraTokensInDatabase(userId, cloudId, {
        access_token: encrypt(accessToken),
        refresh_token: encrypt(newTokens.refresh_token),
        accessTokenExpiry: newAccessTokenExpiry,
      });
    }

    const projectsResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(projectsResponse.data);
  } catch (err: any) {
    console.error(
      "Error fetching Jira projects:",
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
      { message: "Failed to fetch Jira projects." },
      { status: 500 }
    );
  }
}
