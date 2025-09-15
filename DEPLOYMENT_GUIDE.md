# Deployment Guide for Blinkeyit

## Issues Fixed

### 1. CORS Configuration
- Updated server to allow multiple origins (localhost for development, Vercel domain for production)
- Added proper CORS handling for preflight requests

### 2. Cookie Settings
- Made cookie settings environment-aware
- Development: `secure: false, sameSite: "Lax"`
- Production: `secure: true, sameSite: "None"`

### 3. Axios Interceptor Fix
- Fixed the response interceptor bug (was using request interceptor twice)
- Added proper error handling for 401 responses

## Environment Variables Required

### Server (.env)
```
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret
FRONTEND_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### Client (.env)
```
VITE_API_URL=https://your-server-domain.vercel.app
```

## Deployment Steps

### 1. Server Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   - `MONGODB_URL`
   - `SECRET_KEY_ACCESS_TOKEN`
   - `SECRET_KEY_REFRESH_TOKEN`
   - `FRONTEND_URL` (your client Vercel URL)
   - `NODE_ENV=production`

### 2. Client Deployment (Vercel)
1. Deploy the client folder separately
2. Set environment variable:
   - `VITE_API_URL` (your server Vercel URL)

### 3. Important Notes
- Make sure your Vercel domain is added to the CORS allowed origins
- Update the `FRONTEND_URL` in server environment variables to match your client domain
- The server will automatically detect Vercel URL and add it to allowed origins

## Testing
1. Deploy both server and client
2. Test login functionality
3. Verify that cookies are being set properly
4. Test add to cart and other authenticated features

## Troubleshooting
- Check browser console for CORS errors
- Verify environment variables are set correctly
- Ensure both server and client are deployed and accessible
- Check that cookies are being set with proper domain settings
