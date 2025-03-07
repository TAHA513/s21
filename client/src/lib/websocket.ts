
import { createContext, useContext, useEffect, useState } from "react";

// تكوين WebSocket
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
};

export type WebSocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: any[];
  sendMessage: (message: any) => void;
};

// إنشاء سياق WebSocket
const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
});

// مزود WebSocket
export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // إنشاء اتصال WebSocket
  const createWebSocketConnection = () => {
    try {
      console.log("جاري إنشاء اتصال WebSocket...");
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ تم الاتصال بخادم WebSocket");
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 تم استلام رسالة:", data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("❌ خطأ في تحليل رسالة WebSocket:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("❌ تم إغلاق اتصال WebSocket:", event.code, event.reason);
        setIsConnected(false);
        
        // محاولة إعادة الاتصال إذا لم يكن الإغلاق متعمدًا
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`محاولة إعادة الاتصال ${reconnectAttempts + 1}/${maxReconnectAttempts}...`);
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            createWebSocketConnection();
          }, 3000); // إعادة المحاولة بعد 3 ثوانٍ
        } else {
          console.log("تم الوصول إلى الحد الأقصى من محاولات إعادة الاتصال");
        }
      };

      ws.onerror = (error) => {
        console.error("❌ خطأ في اتصال WebSocket:", error);
      };

      setSocket(ws);
      return ws;
    } catch (error) {
      console.error("❌ فشل في إنشاء اتصال WebSocket:", error);
      return null;
    }
  };

  // إرسال رسالة
  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        socket.send(messageString);
        console.log("📤 تم إرسال رسالة:", message);
      } catch (error) {
        console.error("❌ خطأ في إرسال رسالة:", error);
      }
    } else {
      console.warn("⚠️ لا يمكن إرسال الرسالة: الاتصال غير متوفر");
    }
  };

  // إنشاء الاتصال عند تحميل المكون
  useEffect(() => {
    const ws = createWebSocketConnection();
    
    // تنظيف عند إزالة المكون
    return () => {
      if (ws) {
        console.log("🧹 تنظيف اتصال WebSocket");
        ws.close();
      }
    };
  }, [reconnectAttempts]);

  const value = {
    socket,
    isConnected,
    messages,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// مكوّن الاستخدام
export const useWebSocket = () => useContext(WebSocketContext);
