import { google } from 'googleapis';

/**
 * Google OAuth2 Client Configuration
 * Initializes and returns an authorized OAuth2 client using credentials
 * from the environment if configured. Returns null if credentials are not set.
 */
export const getGoogleOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oauth2Client;
  } catch (error) {
    console.error('Failed to initialize Google OAuth2 client:', error.message);
    return null;
  }
};

/**
 * Checks whether Google OAuth is fully configured in the current environment
 */
export const isGoogleConfigured = () => {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_REFRESH_TOKEN?.trim()
  );
};

export default {
  getGoogleOAuthClient,
  isGoogleConfigured,
};
