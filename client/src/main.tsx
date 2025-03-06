import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("لم يتم العثور على عنصر الجذر");
  }

  const root = createRoot(rootElement);

  // Wrap the app in an error boundary
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("خطأ في تحميل التطبيق:", error);
  document.body.innerHTML = `
    <div dir="rtl" style="
      padding: 20px;
      text-align: center;
      font-family: 'Tajawal', sans-serif;
      max-width: 600px;
      margin: 50px auto;
    ">
      <h1 style="color: #ef4444; margin-bottom: 16px;">عذراً، حدث خطأ</h1>
      <p style="color: #666; margin-bottom: 16px;">حدث خطأ أثناء تحميل التطبيق. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.</p>
      <button onclick="window.location.reload()" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">
        إعادة تحميل الصفحة
      </button>
    </div>
  `;
}