const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware Setup
app.use(cors());
app.use(express.json());

// ===================================================
// 🌐  Frontend Serving Routes
// ===================================================

// Route to check server status (for initial connection)
app.get("/status", (req, res) => {
    res.send("SmartTalk Server is running!");
});

// Serve static files (CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public'))); 

// Main route (/) serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===================================================
// 💬  Chat Route with Clean Error Handling
// ===================================================

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ reply: "Error: No message provided." });
    }

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY, 
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }],
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            const errorMessage = errorDetails.error?.message || "Unknown API Error.";
            console.error("Gemini API Error:", response.status, errorMessage);
            
            // *هذا السطر مصحح بالكامل لتجنب خطأ الترميز*
            return res.status(response.status).json({
                reply: API Error: ${response.status} - ${errorMessage}. Please check API Key. 
            });
        }

        const data = await response.json();
        
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI response not received.";

        res.json({ reply });

    } catch (error) {
        console.error("Internal Server Error:", error);
            res.status(500).json({ reply: "Internal Server Error." });
    }
});

app.listen(port, () => {
    console.log(✅ Server running and serving frontend on port ${port});
});
