// This file is used to configure express server without listening to any port or routing
// It is used to start the server differently in different environments
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { xss } from "express-xss-sanitizer";
import mongoSanitize from "express-mongo-sanitize";
import { generalVersions } from "../config/versions.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandler from "./middleware/errorHandler.js";
const ExpressServer = {
    app: express(),
    init() {
        const corsEnvList = process.env.CORS ? process.env.CORS.split(",") : [];
        const whitelist = [
            "http://127.0.0.1:3000",
            "http://localhost:3000",
            "http://127.0.0.1:3001",
            "http://localhost:3001",
            ...corsEnvList,
        ];
        console.log("cors:", whitelist);
        const corsOptions = {
            origin(origin, callback) {
                if (!origin) {
                    // for mobile app and postman client
                    // console.log("origin is null");
                    return callback(null, true);
                }
                if (whitelist.indexOf(origin) !== -1) {
                    // console.log("allowed by CORS");
                    callback(null, true);
                }
                else {
                    // console.log("Not allowed by CORS");
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true, //access-control-allow-credentials:true
            optionsSuccessStatus: 204,
            methods: [
                "GET",
                "POST",
                "DELETE",
                "UPDATE",
                "PUT",
                "PATCH",
                "HEAD",
            ],
            allowedHeaders: "*",
            // exposedHeaders: "*",
        };
        this.app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
        this.app.use(cors(corsOptions));
        this.app.use(helmet());
        this.app.use(xss());
        this.app.use(mongoSanitize());
        this.app.use(express.json());
        this.app.get("/", (req, res) => res.status(200).json({
            server: "running",
            app: generalVersions.app,
        }));
        console.log("NODE_ENV:", process.env.NODE_ENV);
    },
    initComplete(...args) {
        this.app.use(notFoundMiddleware);
        this.app.use(errorHandler);
    },
};
export default ExpressServer;
//# sourceMappingURL=expressConfig.lib.js.map