import express from "express";
import path from "path";
import cors from "cors";

import { inngest, functions } from "./lib/inngest.js";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

const __dirname=path.resolve();

// Middlewares
app.use(express.json());
// credentials: true meaning ?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true}));
app.use(clerkMiddleware()); // This adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chats", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({message: "Success from Backend"});
});

// When you pass an array of middleware to express, it automatically flattens and executes them sequentially, one by one
// app.get("/video-calls", protectRoute, (req, res) => {
//     res.status(200).json({message: "This is a protected route"});
// });

// Make our app ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
};


const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
    } catch (error) {
        console.error("Error starting the server", error);
    }
};

startServer();
