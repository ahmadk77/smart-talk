import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url"; 

// 🛠  تحديد المسارات المطلوبة (ضروري لـ Render و ES Modules)
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const port = process.env.PORT || 3000;

// إعدادات CORS و JSON Middleware
app.use(cors());
app.use(express.json());

// ===================================================
// 🌐  خدمة ملفات الواجهة الأمامية (Frontend)
// ===================================================

// راوت بسيط لتفقد السيرفر (يظهر الرسالة الخضراء)
app.get("/status", (req, res) => {
    res.send("✅ SmartTalk Server is running!");
});

// يخدم الملفات الثابتة (CSS, JS) من مجلد public
app.use(express.static(path.join(__dirname, 'public'))); 

// المسار الرئيسي (/) يعرض index.html من مجلد public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===================================================
// 💬  مسار الدردشة (Back-End Chat Route)
// ===================================================

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ reply: "الرجاء إرسال رسالة." });
    }

    try {
        // نقطة نهاية Gemini API
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
            
            // *السطر الحاسم المصحح (نص الخطأ أصبح إنجليزياً نظيفاً):*
            return res.status(response.status).json({
                reply: API Error: ${response.status} - ${errorMessage}. Please check API Key. 
            });
        }

        const data = await response.json();
        
        // قراءة محتوى الرد من استجابة Gemini
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم استلام رد من الذكاء الاصطناعي.";

        res.json({ reply });

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ reply: "خطأ داخلي في السيرفر." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(✅ Server running on http://localhost:${PORT});
});
