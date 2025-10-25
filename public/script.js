// script.js
const inputField = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const chatContainer = document.querySelector(".chat-container");

// دالة لإضافة الرسائل إلى الشاشة
function addMessage(content, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = content;
  chatContainer.appendChild(message);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// حدث الإرسال
sendButton.addEventListener("click", async () => {
  const userMessage = inputField.value.trim();
  if (userMessage === "") return;

  addMessage(userMessage, "user");
  inputField.value = "";

  // رسالة مؤقتة من البوت
  const botMsg = document.createElement("div");
  botMsg.classList.add("message", "bot");
  botMsg.textContent = "جاري التفكير...";
  chatContainer.appendChild(botMsg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    botMsg.textContent = data.reply || "حدث خطأ، حاول مجددًا.";
  } catch (error) {
    botMsg.textContent = "حدث خطأ بالاتصال بالسيرفر.";
    console.error(error);
  }
});