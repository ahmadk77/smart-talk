import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// قراءة المتغيرات من ملف .env
dotenv.config();
const app = express();

// إعدادات CORS و JSON Middleware
app.use(cors());
app.use(express.json());

// 🔹 راوت بسيط لفحص السيرفر
app.get("/", (req, res) => {
  res.send("✅ SmartTalk Server is running!");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // نقطة نهاية Gemini API (gemini-2.5-flash)
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // تمرير مفتاح Gemini API
        "x-goog-api-key": process.env.GEMINI_API_KEY 
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
      })
    });
    
    // فحص أخطاء الاتصال
    if (!response.ok) {
        const errorDetails = await response.json();
        const errorMessage = errorDetails.error?.message || "خطأ غير محدد من Gemini API.";
        console.error("Gemini API Error:", response.status, errorMessage);
        
        return res.status(response.status).json({ reply: `خطأ API: ${response.status} - ${errorMessage}` });
    }
    
    const data = await response.json();
    
    // قراءة محتوى الرد من استجابة Gemini
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "ما في رد من السيرفر (تحقق من مفتاح GEMINI_API_KEY).";

    res.json({ reply });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ reply: "خطأ داخلي في السيرفر." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
