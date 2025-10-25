import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// إعداد مسار المشروع
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// تحميل ملف البيئة
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// تقديم ملفات الواجهة (frontend)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// 🧩 مسار الذكاء الاصطناعي
// ===============================
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        reply: ❌ خطأ من Google API: ${errorData.error?.message || "غير معروف"},
      });
    }

    const data = await response.json();
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❗ لم يتم استلام رد من Gemini.";

    res.json({ reply: botReply });
  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ reply: "⚠ خطأ داخلي في السيرفر." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(🚀 Server running on http://localhost:${PORT})
);
