// import express from 'express'
// import cors from 'cors'
// import dotenv from 'dotenv'
// dotenv.config()
// import cookieParser from 'cookie-parser'
// import morgan from 'morgan'
// import helmet from 'helmet'
// import connectDB from './config/connectDB.js'
// import userRouter from './route/user.route.js'
// import categoryRouter from './route/category.route.js'
// import uploadRouter from './route/upload.router.js'
// import subCategoryRouter from './route/subCategory.route.js'
// import productRouter from './route/product.route.js'
// import cartRouter from './route/cart.route.js'
// import addressRouter from './route/address.route.js'
// import orderRouter from './route/order.route.js'

// const app = express()
// app.use(cors({
//     credentials : true,
//     origin : function (origin, callback) {
//         // Allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);
        
//         // List of allowed origins
//         const allowedOrigins = [
//             process.env.FRONTEND_URL,
//             'http://localhost:3000',
//             'http://localhost:5173',
//             'https://localhost:3000',
//             'https://blinkeyit-42rn.vercel.app'
//         ];
        
//         // Add your Vercel domain here (replace with your actual Vercel domain)
//         if (process.env.VERCEL_URL) {
//             allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
//         }
        
//         // Normalize origin by removing trailing slash
//         const normalizedOrigin = origin.replace(/\/$/, '');
//         const normalizedAllowedOrigins = allowedOrigins.map(orig => orig ? orig.replace(/\/$/, '') : orig);
        
//         console.log('CORS check - Origin:', normalizedOrigin);
//         console.log('CORS check - Allowed origins:', normalizedAllowedOrigins);
        
//         if (normalizedAllowedOrigins.indexOf(normalizedOrigin) !== -1) {
//             callback(null, true);
//         } else {
//             console.log('CORS blocked origin:', normalizedOrigin);
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// }))
// app.use(express.json())
// app.use(cookieParser())
// app.use(morgan('combined'))
// app.use(helmet({
//     crossOriginResourcePolicy : false
// }))

// // Handle preflight requests
// app.options('*', cors())

// const PORT = 8080 || process.env.PORT 

// app.get("/",(request,response)=>{
//     ///server to client
//     response.json({
//         message : "Server is running " + PORT
//     })
// })

// app.use('/api/user',userRouter)
// app.use("/api/category",categoryRouter)
// app.use("/api/file",uploadRouter)
// app.use("/api/subcategory",subCategoryRouter)
// app.use("/api/product",productRouter)
// app.use("/api/cart",cartRouter)
// app.use("/api/address",addressRouter)
// app.use('/api/order',orderRouter)

// connectDB().then(()=>{
//     app.listen(PORT,()=>{
//         console.log("Server is running",PORT)
//     })
// })

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";

import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import uploadRouter from "./route/upload.router.js";
import subCategoryRouter from "./route/subCategory.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import addressRouter from "./route/address.route.js";
import orderRouter from "./route/order.route.js";

const app = express();

// ----------------------------
// CORS - allow frontend + local + vercel previews
// ----------------------------
const allowedOrigins = [
  "https://blinkeyit-42rn.vercel.app", // your frontend production
  "http://localhost:3000",
  "http://localhost:5173"
];

// Allow Vercel preview domains for this project (e.g. blinkeyit-abc123.vercel.app)
const vercelPreviewRegex = /^https:\/\/blinkeyit-.*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests like curl, server-to-server with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// ----------------------------
// Middlewares
// ----------------------------
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// ----------------------------
// Routes
// ----------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Server is running on port " + (process.env.PORT || 8080)
  });
});

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// ----------------------------
// Start server
// ----------------------------
const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
