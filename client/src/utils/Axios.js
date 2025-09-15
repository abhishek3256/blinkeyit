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
    
    // If not found, try to get from cookies
    if (!token) {
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(cookie => 
            cookie.trim().startsWith('accessToken=')
        )
        if (tokenCookie) {
            token = tokenCookie.split('=')[1]
        }
    }
    
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

export default Axios