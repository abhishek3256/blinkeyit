import axios from "axios";
import SummaryApi , { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL : baseURL,
    withCredentials : true
})

// Helper function to get token from localStorage or cookies
const getAccessToken = () => {
    // First try localStorage
    let token = localStorage.getItem('accesstoken')
    console.log('getAccessToken - localStorage token:', token ? 'Found' : 'Not Found');
    
    // If not found, try to get from cookies
    if (!token) {
        console.log('getAccessToken - Checking cookies...');
        console.log('getAccessToken - All cookies:', document.cookie);
        
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(cookie => 
            cookie.trim().startsWith('accessToken=')
        )
        
        console.log('getAccessToken - Token cookie found:', !!tokenCookie);
        
        if (tokenCookie) {
            token = tokenCookie.split('=')[1]
            console.log('getAccessToken - Token from cookie:', token ? 'Found' : 'Not Found');
        }
    }
    
    console.log('getAccessToken - Final token:', token ? 'Found' : 'Not Found');
    return token
}

//sending access token in the header
Axios.interceptors.request.use(
    async(config)=>{
        const accessToken = getAccessToken()
        
        console.log('Axios Request - Access Token:', accessToken ? 'Found' : 'Not Found');
        console.log('Axios Request - URL:', config.url);

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

//extend the life span of access token with 
// the help refresh
Axios.interceptors.response.use(
    (response)=>{
        return response
    },
    async(error)=>{
        let originRequest = error.config 

        if(error.response?.status === 401 && !originRequest.retry){
            originRequest.retry = true

            const refreshToken = localStorage.getItem("refreshToken") || 
                document.cookie.split(';').find(cookie => 
                    cookie.trim().startsWith('refreshToken=')
                )?.split('=')[1]

            if(refreshToken){
                const newAccessToken = await refreshAccessToken(refreshToken)

                if(newAccessToken){
                    originRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return Axios(originRequest)
                }
            }
        }
        
        return Promise.reject(error)
    }
)


const refreshAccessToken = async(refreshToken)=>{
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers : {
                Authorization : `Bearer ${refreshToken}`
            }
        })

        const accessToken = response.data.data.accessToken
        localStorage.setItem('accesstoken',accessToken)
        return accessToken
    } catch (error) {
        console.log(error)
    }
}

// Debug function - call this from browser console to check tokens
window.debugTokens = () => {
    console.log('=== TOKEN DEBUG ===');
    console.log('localStorage accesstoken:', localStorage.getItem('accesstoken'));
    console.log('localStorage refreshToken:', localStorage.getItem('refreshToken'));
    console.log('All cookies:', document.cookie);
    
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('accessToken=')
    );
    const refreshTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('refreshToken=')
    );
    
    console.log('accessToken cookie:', accessTokenCookie);
    console.log('refreshToken cookie:', refreshTokenCookie);
    console.log('==================');
}

export default Axios