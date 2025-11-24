import UserModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'

const REFRESH_TOKEN_SECRET = process.env.SECRET_KEY_REFRESH_TOKEN
    || process.env.REFRESH_TOKEN_SECRET
    || 'blinkeyit-refresh-token-secret'

const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'

const genertedRefreshToken = async(userId)=>{
    const payload = { id : userId }

    if(!userId){
        console.warn('generatedRefreshToken called without userId')
    }

    if(!REFRESH_TOKEN_SECRET){
        throw new Error('Refresh token secret is missing')
    }

    const token = await jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn : REFRESH_TOKEN_EXPIRY })

    await UserModel.updateOne(
        { _id : userId},
        {
            refresh_token : token
        }
    )

    return token
}

export default genertedRefreshToken