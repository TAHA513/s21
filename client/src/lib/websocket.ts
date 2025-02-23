// Helper to get WebSocket URL based on current environment
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = '5000'; // Use explicit port for WebSocket server

  // Log debugging information
  console.log('Current location:', {
    protocol: window.location.protocol,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port,
    pathname: window.location.pathname,
    href: window.location.href
  });

  // Build WebSocket URL with explicit port
  const wsUrl = `${protocol}//${host}:${port}/ws`;
  console.log('WebSocket URL:', wsUrl);
  return wsUrl;
}

export function createWebSocket(): WebSocket {
  try {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    // Log WebSocket state changes
    const logState = () => {
      const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
      console.log('WebSocket state:', states[ws.readyState]);
    };

    ws.onopen = () => {
      console.log('WebSocket connection established successfully');
      logState();
      // Try to send a test message
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
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      logState();
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      // Log additional details about the connection attempt
      console.error('Failed connection details:', {
        url: wsUrl,
        readyState: ws.readyState,
        protocol: ws.protocol,
        extensions: ws.extensions,
        state: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState]
      });
      logState();
    };

    // Log initial state
    logState();

    return ws;
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
    throw error;
  }
}