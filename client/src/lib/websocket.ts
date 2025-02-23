// Helper to get WebSocket URL based on current environment
export function getWebSocketUrl(): string {
  // Use the same protocol as the page (http -> ws, https -> wss)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // This includes hostname and port

  // Build WebSocket URL
  const wsUrl = `${protocol}//${host}/ws`;
  console.log('WebSocket URL:', wsUrl);
  return wsUrl;
}

export function createWebSocket(): WebSocket {
  try {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    // Connection timeout handler
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.error('WebSocket connection timeout');
        ws.close();
      }
    }, 5000);

    // Log WebSocket state changes
    const logState = () => {
      const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
      console.log('WebSocket state:', states[ws.readyState]);
    };

    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket connection established successfully');
      logState();
      try {
        ws.send('Test message from client');
      } catch (error) {
        console.error('Error sending test message:', error);
      }
    };

    ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
    };

    ws.onclose = (event) => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      logState();
    };

    ws.onerror = (error) => {
      clearTimeout(connectionTimeout);
      console.error('WebSocket error:', error);
      logState();
    };

    return ws;
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
    throw error;
  }
}