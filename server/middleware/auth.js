import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.SECRET_KEY_ACCESS_TOKEN
    || process.env.ACCESS_TOKEN_SECRET
    || 'blinkeyit-access-token-secret'

const auth = async (request, response, next) => {
    try {
        let token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]

        console.log('Auth middleware - Cookies:', request.cookies);
        console.log('Auth middleware - Authorization header:', request?.headers?.authorization);

        if (!token && request?.headers?.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else {
                token = authHeader;
            }
        }

        console.log('Auth middleware - Token found:', !!token);

        if (!token) {
            return response.status(401).json({
                message: "Provide token"
            })
        }

        const decode = await jwt.verify(token, ACCESS_TOKEN_SECRET)

        if (!decode) {
            return response.status(401).json({
                message: "unauthorized access",
                error: true,
                success: false
            })
        }

        request.userId = decode.id

        next()

    } catch (error) {
        return response.status(500).json({
            message: "You have not login",///error.message || error,
            error: true,
            success: false
        })
    }
}

export default auth