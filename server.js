import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // استيراد مكتبة path
import { fileURLToPath } from "url"; // استيراد وظيفة لمسارات ES Modules

// تعريف __dirname و __filename لمشاريع ES Modules
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// قراءة المتغيرات من ملف .env
dotenv.config();
const app = express();

// إعدادات CORS و JSON Middleware
app.use(cors());
app.use(express.json());

// ===================================================
// 🛠  إضافة كود خدمة الواجهة الأمامية (Frontend)
// ===================================================

// 1. يخدم الملفات الثابتة (CSS, JS, images) من مجلد public
// (هذا ضروري لعمل ملفات script.js و style.css)
app.use(express.static(path.join(__dirname, 'public'))); 

// 2. معالجة المسار الرئيسي (/) ليعرض index.html بدلاً من الرسالة النصية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===================================================

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
        
        return res.status(response.status).json({ reply: خطأ API: ${response.status} - ${errorMessage} });
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

const PORT = process.env.PORT || 3000; // استخدام PORT من متغيرات البيئة لـ Render
app.listen(PORT, () => console.log(✅ Server running on http://localhost:${PORT}));
