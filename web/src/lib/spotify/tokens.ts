import { apiRequest } from "@/lib/api/requests";
import { prisma } from "@/lib/prisma-client";
import { AuthError, RequestError } from "@/lib/errors";

import { Account } from "@/generated/prisma";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export const getSpotifyAccessToken = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "spotify",
    },
  });

  if (!account) {
    throw new AuthError("Spotify account not found");
  }
  if (!account.expires_at) {
    throw new AuthError("Missing token expiration timestamp");
  }

  const tokenExpired = account.expires_at < Date.now() / 1000 + 60;
  if (!tokenExpired && account.access_token) {
    return account.access_token;
  }

  return await refreshSpotifyAccessToken(account);
};

export const refreshSpotifyAccessToken = async (account: Account) => {
  if (!account.refresh_token) {
    throw new AuthError("Missing Spotify refresh token");
  }

  const result = await apiRequest<RefreshTokenResponse>(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token!,
      }),
    }
  );
  if (!result.success) {
    throw new RequestError("Cannot fetch refresh token successfully");
  }

  const tokens = result.data;

  const updatedAccount = await prisma.account.update({
    where: {
      provider_providerAccountId: {
        provider: "spotify",
        providerAccountId: account.providerAccountId,
      },
    },
    data: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? account.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
    },
  });

  return updatedAccount.access_token!;
};
