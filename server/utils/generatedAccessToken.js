import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.SECRET_KEY_ACCESS_TOKEN
    || process.env.ACCESS_TOKEN_SECRET
    || 'blinkeyit-access-token-secret'

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '5h'

const generatedAccessToken = async(userId)=>{
    const payload = { id : userId }

    if(!userId){
        console.warn('generatedAccessToken called without userId')
    }

    if(!ACCESS_TOKEN_SECRET){
        throw new Error('Access token secret is missing')
    }

    const token = await jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn : ACCESS_TOKEN_EXPIRY })

    return token
}

export default generatedAccessToken