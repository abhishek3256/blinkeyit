// import sendEmail from '../config/sendEmail.js'
// import UserModel from '../models/user.model.js'
// import bcryptjs from 'bcryptjs'
// import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
// import generatedAccessToken from '../utils/generatedAccessToken.js'
// import genertedRefreshToken from '../utils/generatedRefreshToken.js'
// import uploadImageClodinary from '../utils/uploadImageClodinary.js'
// import generatedOtp from '../utils/generatedOtp.js'
// import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
// import jwt from 'jsonwebtoken'

// export async function registerUserController(request,response){
//     try {
//         const { name, email , password } = request.body

//         if(!name || !email || !password){
//             return response.status(400).json({
//                 message : "provide email, name, password",
//                 error : true,
//                 success : false
//             })
//         }

//         const user = await UserModel.findOne({ email })

//         if(user){
//             return response.json({
//                 message : "Already register email",
//                 error : true,
//                 success : false
//             })
//         }

//         const salt = await bcryptjs.genSalt(10)
//         const hashPassword = await bcryptjs.hash(password,salt)

//         const payload = {
//             name,
//             email,
//             password : hashPassword
//         }

//         const newUser = new UserModel(payload)
//         const save = await newUser.save()

//         const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

//         const verifyEmail = await sendEmail({
//             sendTo : email,
//             subject : "Verify email from binkeyit",
//             html : verifyEmailTemplate({
//                 name,
//                 url : VerifyEmailUrl
//             })
//         })

//         return response.json({
//             message : "User register successfully",
//             error : false,
//             success : true,
//             data : save
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// export async function verifyEmailController(request,response){
//     try {
//         const { code } = request.body

//         const user = await UserModel.findOne({ _id : code})

//         if(!user){
//             return response.status(400).json({
//                 message : "Invalid code",
//                 error : true,
//                 success : false
//             })
//         }

//         const updateUser = await UserModel.updateOne({ _id : code },{
//             verify_email : true
//         })

//         return response.json({
//             message : "Verify email done",
//             success : true,
//             error : false
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : true
//         })
//     }
// }

// //login controller
// export async function loginController(request,response){
//     try {
//         console.log('Login controller - Request received');
//         console.log('Login controller - Headers:', request.headers);
//         console.log('Login controller - Origin:', request.headers.origin);
        
//         const { email , password } = request.body


//         if(!email || !password){
//             return response.status(400).json({
//                 message : "provide email, password",
//                 error : true,
//                 success : false
//             })
//         }

//         const user = await UserModel.findOne({ email })

//         if(!user){
//             return response.status(400).json({
//                 message : "User not register",
//                 error : true,
//                 success : false
//             })
//         }

//         if(user.status !== "Active"){
//             return response.status(400).json({
//                 message : "Contact to Admin",
//                 error : true,
//                 success : false
//             })
//         }

//         const checkPassword = await bcryptjs.compare(password,user.password)

//         if(!checkPassword){
//             return response.status(400).json({
//                 message : "Check your password",
//                 error : true,
//                 success : false
//             })
//         }

//         const accesstoken = await generatedAccessToken(user._id)
//         const refreshToken = await genertedRefreshToken(user._id)

//         const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
//             last_login_date : new Date()
//         })

//         // Try to set cookies, but don't rely on them for cross-origin
//         const cookiesOption = {
//             httpOnly : false,
//             secure : process.env.NODE_ENV === 'production',
//             sameSite : process.env.NODE_ENV === 'production' ? "None" : "Lax",
//             path: '/',
//             maxAge: 5 * 60 * 60 * 1000
//         }
        
//         console.log('Login - NODE_ENV:', process.env.NODE_ENV);
//         console.log('Login - Cookie options:', cookiesOption);
//         console.log('Login - Setting accessToken cookie:', !!accesstoken);
//         console.log('Login - Setting refreshToken cookie:', !!refreshToken);
        
//         try {
//             response.cookie('accessToken',accesstoken,cookiesOption)
//             response.cookie('refreshToken',refreshToken,cookiesOption)
//             console.log('Login - Cookies set successfully');
//         } catch (cookieError) {
//             console.log('Login - Cookie setting failed:', cookieError.message);
//         }

//         return response.json({
//             message : "Login successfully",
//             error : false,
//             success : true,
//             data : {
//                 accessToken: accesstoken,
//                 refreshToken
//             }
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //logout controller
// export async function logoutController(request,response){
//     try {
//         const userid = request.userId //middleware

//         const cookiesOption = {
//             httpOnly : false, // Allow JavaScript access in production
//             secure : false, // Set to false for now to test
//             sameSite : "Lax", // Use Lax for better compatibility
//             path: '/',
//             maxAge: 5 * 60 * 60 * 1000 // 5 hours
//         }

//         response.clearCookie("accessToken",cookiesOption)
//         response.clearCookie("refreshToken",cookiesOption)

//         const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
//             refresh_token : ""
//         })

//         return response.json({
//             message : "Logout successfully",
//             error : false,
//             success : true
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //upload user avatar
// export async  function uploadAvatar(request,response){
//     try {
//         const userId = request.userId // auth middlware
//         const image = request.file  // multer middleware

//         const upload = await uploadImageClodinary(image)
        
//         const updateUser = await UserModel.findByIdAndUpdate(userId,{
//             avatar : upload.url
//         })

//         return response.json({
//             message : "upload profile",
//             success : true,
//             error : false,
//             data : {
//                 _id : userId,
//                 avatar : upload.url
//             }
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //update user details
// export async function updateUserDetails(request,response){
//     try {
//         const userId = request.userId //auth middleware
//         const { name, email, mobile, password } = request.body 

//         let hashPassword = ""

//         if(password){
//             const salt = await bcryptjs.genSalt(10)
//             hashPassword = await bcryptjs.hash(password,salt)
//         }

//         const updateUser = await UserModel.updateOne({ _id : userId},{
//             ...(name && { name : name }),
//             ...(email && { email : email }),
//             ...(mobile && { mobile : mobile }),
//             ...(password && { password : hashPassword })
//         })

//         return response.json({
//             message : "Updated successfully",
//             error : false,
//             success : true,
//             data : updateUser
//         })


//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //forgot password not login
// export async function forgotPasswordController(request,response) {
//     try {
//         const { email } = request.body 

//         const user = await UserModel.findOne({ email })

//         if(!user){
//             return response.status(400).json({
//                 message : "Email not available",
//                 error : true,
//                 success : false
//             })
//         }

//         const otp = generatedOtp()
//         const expireTime = new Date() + 60 * 60 * 1000 // 1hr

//         const update = await UserModel.findByIdAndUpdate(user._id,{
//             forgot_password_otp : otp,
//             forgot_password_expiry : new Date(expireTime).toISOString()
//         })

//         await sendEmail({
//             sendTo : email,
//             subject : "Forgot password from Binkeyit",
//             html : forgotPasswordTemplate({
//                 name : user.name,
//                 otp : otp
//             })
//         })

//         return response.json({
//             message : "check your email",
//             error : false,
//             success : true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //verify forgot password otp
// export async function verifyForgotPasswordOtp(request,response){
//     try {
//         const { email , otp }  = request.body

//         if(!email || !otp){
//             return response.status(400).json({
//                 message : "Provide required field email, otp.",
//                 error : true,
//                 success : false
//             })
//         }

//         const user = await UserModel.findOne({ email })

//         if(!user){
//             return response.status(400).json({
//                 message : "Email not available",
//                 error : true,
//                 success : false
//             })
//         }

//         const currentTime = new Date().toISOString()

//         if(user.forgot_password_expiry < currentTime  ){
//             return response.status(400).json({
//                 message : "Otp is expired",
//                 error : true,
//                 success : false
//             })
//         }

//         if(otp !== user.forgot_password_otp){
//             return response.status(400).json({
//                 message : "Invalid otp",
//                 error : true,
//                 success : false
//             })
//         }

//         //if otp is not expired
//         //otp === user.forgot_password_otp

//         const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
//             forgot_password_otp : "",
//             forgot_password_expiry : ""
//         })
        
//         return response.json({
//             message : "Verify otp successfully",
//             error : false,
//             success : true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //reset the password
// export async function resetpassword(request,response){
//     try {
//         const { email , newPassword, confirmPassword } = request.body 

//         if(!email || !newPassword || !confirmPassword){
//             return response.status(400).json({
//                 message : "provide required fields email, newPassword, confirmPassword"
//             })
//         }

//         const user = await UserModel.findOne({ email })

//         if(!user){
//             return response.status(400).json({
//                 message : "Email is not available",
//                 error : true,
//                 success : false
//             })
//         }

//         if(newPassword !== confirmPassword){
//             return response.status(400).json({
//                 message : "newPassword and confirmPassword must be same.",
//                 error : true,
//                 success : false,
//             })
//         }

//         const salt = await bcryptjs.genSalt(10)
//         const hashPassword = await bcryptjs.hash(newPassword,salt)

//         const update = await UserModel.findOneAndUpdate(user._id,{
//             password : hashPassword
//         })

//         return response.json({
//             message : "Password updated successfully.",
//             error : false,
//             success : true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }


// //refresh token controler
// export async function refreshToken(request,response){
//     try {
//         const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

//         if(!refreshToken){
//             return response.status(401).json({
//                 message : "Invalid token",
//                 error  : true,
//                 success : false
//             })
//         }

//         const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

//         if(!verifyToken){
//             return response.status(401).json({
//                 message : "token is expired",
//                 error : true,
//                 success : false
//             })
//         }

//         const userId = verifyToken?._id

//         const newAccessToken = await generatedAccessToken(userId)

//         const cookiesOption = {
//             httpOnly : false, // Allow JavaScript access in production
//             secure : false, // Set to false for now to test
//             sameSite : "Lax", // Use Lax for better compatibility
//             path: '/',
//             maxAge: 5 * 60 * 60 * 1000 // 5 hours
//         }

//         response.cookie('accessToken',newAccessToken,cookiesOption)

//         return response.json({
//             message : "New Access token generated",
//             error : false,
//             success : true,
//             data : {
//                 accessToken : newAccessToken
//             }
//         })


//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// //get login user details
// export async function userDetails(request,response){
//     try {
//         const userId  = request.userId

//         console.log(userId)

//         const user = await UserModel.findById(userId).select('-password -refresh_token')

//         return response.json({
//             message : 'user details',
//             data : user,
//             error : false,
//             success : true
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : "Something is wrong",
//             error : true,
//             success : false
//         })
//     }
// }


import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import generatedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'


// =======================================================================
// GLOBAL COOKIE OPTIONS (Production Safe)
// =======================================================================
const cookieOptions = {
    httpOnly: true,            // JS cannot read cookies
    secure: true,              // must be true on HTTPS
    sameSite: "none",          // allow cross-site (frontend <-> backend)
    path: "/",                 // entire site
    maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
};


// =======================================================================
// REGISTER USER
// =======================================================================
export async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Provide name, email, password",
                error: true
            });
        }

        const existing = await UserModel.findOne({ email });
        if (existing) {
            return res.status(400).json({
                message: "Email already registered",
                error: true
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashed = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashed
        });

        const saved = await newUser.save();

        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?code=${saved._id}`;

        await sendEmail({
            sendTo: email,
            subject: "Verify your email",
            html: verifyEmailTemplate({ name, url: verifyUrl })
        });

        return res.json({
            message: "User registered successfully",
            success: true,
            data: saved
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// VERIFY EMAIL
// =======================================================================
export async function verifyEmailController(req, res) {
    try {
        const { code } = req.body;

        const user = await UserModel.findById(code);

        if (!user) {
            return res.status(400).json({
                message: "Invalid verification code",
                error: true
            });
        }

        await UserModel.findByIdAndUpdate(code, { verify_email: true });

        return res.json({
            message: "Email verified successfully",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// LOGIN USER
// =======================================================================
export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Provide email & password",
                error: true
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Email not registered",
                error: true
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Account inactive. Contact Admin",
                error: true
            });
        }

        const match = await bcryptjs.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                message: "Incorrect password",
                error: true
            });
        }

        const accessToken = generatedAccessToken(user._id);
        const refreshToken = generatedRefreshToken(user._id);

        await UserModel.findByIdAndUpdate(user._id, {
            refresh_token: refreshToken,
            last_login_date: new Date()
        });

        // Set cookies
        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.json({
            message: "Login successful",
            success: true,
            data: { accessToken }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// LOGOUT USER
// =======================================================================
export async function logoutController(req, res) {
    try {
        const userId = req.userId;

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        await UserModel.findByIdAndUpdate(userId, {
            refresh_token: ""
        });

        return res.json({
            message: "Logged out successfully",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// UPLOAD AVATAR
// =======================================================================
export async function uploadAvatar(req, res) {
    try {
        const userId = req.userId;
        const file = req.file;

        const upload = await uploadImageClodinary(file);

        await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        });

        return res.json({
            message: "Avatar updated",
            success: true,
            data: { _id: userId, avatar: upload.url }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// UPDATE USER DETAILS
// =======================================================================
export async function updateUserDetails(req, res) {
    try {
        const userId = req.userId;
        const { name, email, mobile, password } = req.body;

        let hashed = "";

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashed = await bcryptjs.hash(password, salt);
        }

        const update = await UserModel.updateOne(
            { _id: userId },
            {
                ...(name && { name }),
                ...(email && { email }),
                ...(mobile && { mobile }),
                ...(password && { password: hashed })
            }
        );

        return res.json({
            message: "Updated successfully",
            success: true,
            data: update
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// FORGOT PASSWORD EMAIL OTP
// =======================================================================
export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Email not registered",
                error: true
            });
        }

        const otp = generatedOtp();
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: expiry
        });

        await sendEmail({
            sendTo: email,
            subject: "Your OTP for password reset",
            html: forgotPasswordTemplate({ name: user.name, otp })
        });

        return res.json({
            message: "OTP sent to email",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// VERIFY OTP
// =======================================================================
export async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Email not found",
                error: true
            });
        }

        if (user.forgot_password_expiry < new Date()) {
            return res.status(400).json({
                message: "OTP expired",
                error: true
            });
        }

        if (otp !== user.forgot_password_otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                error: true
            });
        }

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: "",
            forgot_password_expiry: ""
        });

        return res.json({
            message: "OTP verified",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// RESET PASSWORD
// =======================================================================
export async function resetpassword(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Provide all fields",
                error: true
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                error: true
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashed = await bcryptjs.hash(newPassword, salt);

        await UserModel.findOneAndUpdate({ email }, { password: hashed });

        return res.json({
            message: "Password updated",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}


// =======================================================================
// REFRESH TOKEN
// =======================================================================
export async function refreshToken(req, res) {
    try {
        const token =
            req.cookies.refreshToken ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Missing refresh token",
                error: true
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY_REFRESH_TOKEN
        );

        const newAccessToken = generatedAccessToken(decoded._id);

        res.cookie("accessToken", newAccessToken, cookieOptions);

        return res.json({
            message: "New access token generated",
            success: true,
            data: { accessToken: newAccessToken }
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            error: true
        });
    }
}


// =======================================================================
// USER DETAILS
// =======================================================================
export async function userDetails(req, res) {
    try {
        const userId = req.userId;

        const user = await UserModel.findById(userId)
            .select("-password -refresh_token");

        return res.json({
            message: "User details",
            success: true,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}
