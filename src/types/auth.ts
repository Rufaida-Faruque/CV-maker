export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface StoredAuth {
  accessToken: string;
  expiresAt: number;
  user: GoogleUser;
}
