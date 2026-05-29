import type { GoogleUser } from "../types/auth";

export async function fetchGoogleUser(
  accessToken: string,
): Promise<GoogleUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Could not load Google profile");
  }
  const data = (await res.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };
  return {
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}
