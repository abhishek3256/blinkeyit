// import axios from "axios";
// import SummaryApi , { baseURL } from "../common/SummaryApi";

// const Axios = axios.create({
//     baseURL : baseURL,
//     withCredentials : true
// })

// // Helper function to get token from localStorage or cookies
// const getAccessToken = () => {
//     // First try localStorage (primary method)
//     let token = localStorage.getItem('accesstoken')
//     console.log('getAccessToken - localStorage token:', token ? 'Found' : 'Not Found');
    
//     // If not found, try to get from cookies (fallback)
//     if (!token) {
//         console.log('getAccessToken - Checking cookies...');
//         console.log('getAccessToken - All cookies:', document.cookie);
        
//         const cookies = document.cookie.split(';')
//         const tokenCookie = cookies.find(cookie => 
//             cookie.trim().startsWith('accessToken=')
//         )
        
//         console.log('getAccessToken - Token cookie found:', !!tokenCookie);
        
//         if (tokenCookie) {
//             token = tokenCookie.split('=')[1]
//             console.log('getAccessToken - Token from cookie:', token ? 'Found' : 'Not Found');
//         }
//     }
    
//     console.log('getAccessToken - Final token:', token ? 'Found' : 'Not Found');
    
//     // If still no token, check if user is logged in
//     if (!token) {
//         console.log('getAccessToken - No token found. User may not be logged in.');
//     }
    
//     return token
// }

// //sending access token in the header
// Axios.interceptors.request.use(
//     async(config)=>{
//         const accessToken = getAccessToken()
        
//         console.log('Axios Request - Access Token:', accessToken ? 'Found' : 'Not Found');
//         console.log('Axios Request - URL:', config.url);

//         if(accessToken){
//             config.headers.Authorization = `Bearer ${accessToken}`
//         }

//         return config
//     },
//     (error)=>{
//         return Promise.reject(error)
//     }
// )

// //extend the life span of access token with 
// // the help refresh
// Axios.interceptors.response.use(
//     (response)=>{
//         return response
//     },
//     async(error)=>{
//         let originRequest = error.config 

//         if(error.response?.status === 401 && !originRequest.retry){
//             originRequest.retry = true

//             const refreshToken = localStorage.getItem("refreshToken") || 
//                 document.cookie.split(';').find(cookie => 
//                     cookie.trim().startsWith('refreshToken=')
//                 )?.split('=')[1]

//             if(refreshToken){
//                 const newAccessToken = await refreshAccessToken(refreshToken)

//                 if(newAccessToken){
//                     originRequest.headers.Authorization = `Bearer ${newAccessToken}`
//                     return Axios(originRequest)
//                 }
//             }
//         }
        
//         return Promise.reject(error)
//     }
// )


// const refreshAccessToken = async(refreshToken)=>{
//     try {
//         const response = await Axios({
//             ...SummaryApi.refreshToken,
//             headers : {
//                 Authorization : `Bearer ${refreshToken}`
//             }
//         })

//         const accessToken = response.data.data.accessToken
//         localStorage.setItem('accesstoken',accessToken)
//         return accessToken
//     } catch (error) {
//         console.log(error)
//     }
// }

// // Debug function - call this from browser console to check tokens
// window.debugTokens = () => {
//     console.log('=== TOKEN DEBUG ===');
//     console.log('localStorage accesstoken:', localStorage.getItem('accesstoken'));
//     console.log('localStorage refreshToken:', localStorage.getItem('refreshToken'));
//     console.log('All cookies:', document.cookie);
    
//     const cookies = document.cookie.split(';');
//     const accessTokenCookie = cookies.find(cookie => 
//         cookie.trim().startsWith('accessToken=')
//     );
//     const refreshTokenCookie = cookies.find(cookie => 
//         cookie.trim().startsWith('refreshToken=')
//     );
    
//     console.log('accessToken cookie:', accessTokenCookie);
//     console.log('refreshToken cookie:', refreshTokenCookie);
//     console.log('==================');
// }

// // Test function to manually set a token
// window.testToken = () => {
//     const testToken = 'test-token-123';
//     localStorage.setItem('accesstoken', testToken);
//     console.log('Test token set:', testToken);
//     console.log('Test token retrieved:', localStorage.getItem('accesstoken'));
// }

// // Test function to simulate login response
// window.testLogin = () => {
//     const mockResponse = {
//         data: {
//             success: true,
//             data: {
//                 accessToken: 'mock-access-token-123',
//                 refreshToken: 'mock-refresh-token-456'
//             }
//         }
//     };
    
//     console.log('Testing login simulation...');
//     localStorage.setItem('accesstoken', mockResponse.data.data.accessToken);
//     localStorage.setItem('refreshToken', mockResponse.data.data.refreshToken);
    
//     console.log('Mock tokens stored');
//     console.log('Access token:', localStorage.getItem('accesstoken'));
//     console.log('Refresh token:', localStorage.getItem('refreshToken'));
// }

// export default Axios

import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true // send cookies (httpOnly refresh token) automatically
});

// Request interceptor: attach access token from localStorage
Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint — cookie is sent automatically by browser
        // SummaryApi.refreshToken should be a config object or URL you already define
        const refreshResponse = await Axios(SummaryApi.refreshToken);

        const newAccessToken = refreshResponse?.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed — user must re-authenticate
        console.log("Token refresh failed:", refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;
