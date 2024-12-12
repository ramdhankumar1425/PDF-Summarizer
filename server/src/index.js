require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { handleGetSummary } = require("./controllers/summary.controller");
const { rateLimit } = require("express-rate-limit");

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URI,
    methods: "GET,POST",
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20, // can be changed according to the requirement
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { msg: "Too many requests, please try again later." },
    statusCode: 429,
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use("/api/summary", limiter);

// Confing multer for storing file
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
});

// routes
app.post("/api/summary", upload.single("file"), handleGetSummary);

app.get("/test", (req, res) => {
    console.log("Server is working...");
    res.send("Server is working...");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
