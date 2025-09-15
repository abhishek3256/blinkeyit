# Vercel Deployment Guide for Blinkeyit

## Issues Fixed

### 1. CORS Configuration
- Updated server to handle multiple origins (localhost, Vercel domains)
- Added dynamic origin checking for development and production

### 2. Cookie Configuration
- Made cookies environment-aware (secure only in production)
- Fixed sameSite settings for cross-origin requests
- Proper domain handling for production

### 3. Axios Configuration
- Added timeout and proper headers
- Fixed response interceptor (was incorrectly using request interceptor)
- Better error handling for token refresh

### 4. Authentication Flow
- Improved token storage and retrieval
- Better error handling in login process
- Automatic token cleanup on refresh failure

## Environment Variables Setup

### Server Environment Variables (Vercel)
Set these in your Vercel dashboard under Project Settings > Environment Variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret
FRONTEND_URL=https://your-client-domain.vercel.app
RESEND_API_KEY=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Client Environment Variables (Vercel)
Set these in your client Vercel dashboard:

```
VITE_API_URL=https://your-server-domain.vercel.app
```

## Deployment Steps

### 1. Deploy Server to Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `server`
3. Set build command: `npm install`
4. Set output directory: `.` (root)
5. Add all environment variables listed above

### 2. Deploy Client to Vercel
1. Create a new Vercel project for the client
2. Set the root directory to `client`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add the client environment variable

### 3. Update CORS Origins
After deployment, update the CORS origins in `server/index.js` to include your actual Vercel domains:

```javascript
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-actual-client-domain.vercel.app', // Update this
    'https://your-actual-server-domain.vercel.app'  // Update this
];
```

## Testing the Fix

### 1. Test Login Flow
1. Go to your deployed client URL
2. Try to log in with valid credentials
3. Check browser developer tools > Application > Cookies
4. Verify that accessToken and refreshToken cookies are set
5. Check Network tab to ensure API calls include credentials

### 2. Test Protected Routes
1. After login, try accessing protected pages
2. Test add to cart functionality
3. Test logout functionality
4. Verify that tokens are properly cleared on logout

### 3. Test Token Refresh
1. Wait for access token to expire (5 hours)
2. Make an API call that requires authentication
3. Verify that the token is automatically refreshed
4. Check that the user remains logged in

## Common Issues and Solutions

### Issue: "Provide access token" error
**Solution**: Check that:
- CORS is properly configured
- Environment variables are set correctly
- Client is making requests to the correct server URL

### Issue: Cookies not being set
**Solution**: Verify that:
- Server is running in production mode (NODE_ENV=production)
- Cookies have correct sameSite and secure settings
- Client is using withCredentials: true

### Issue: CORS errors
**Solution**: Ensure that:
- Server allows your client domain in CORS origins
- Both client and server are using HTTPS in production
- Credentials are enabled in CORS configuration

## Additional Recommendations

1. **Use HTTPS**: Always use HTTPS in production for secure cookie transmission
2. **Monitor Logs**: Check Vercel function logs for any errors
3. **Test Thoroughly**: Test all authentication flows after deployment
4. **Update Domains**: Remember to update CORS origins with your actual Vercel domains

## Files Modified

- `server/index.js` - CORS configuration
- `server/controllers/user.controller.js` - Cookie settings
- `client/src/utils/Axios.js` - Request/response handling
- `client/src/pages/Login.jsx` - Login flow improvements
- `server/middleware/auth.js` - Better error handling
- `server/vercel.json` - Production environment setting
