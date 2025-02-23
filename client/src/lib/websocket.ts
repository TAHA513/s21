// Helper to get WebSocket URL based on current environment
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  // Log debugging information
  console.log('Current location:', {
    protocol: window.location.protocol,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port
  });

  // For Replit environment, use the current host
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  console.log('WebSocket URL:', wsUrl);
  return wsUrl;
}

export function createWebSocket(): WebSocket {
  try {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established successfully');
    };

    ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      // Log additional details about the connection attempt
      console.error('Failed connection details:', {
        url: wsUrl,
        readyState: ws.readyState,
        protocol: ws.protocol,
        extensions: ws.extensions
      });
    };

    return ws;
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
    throw error;
  }
}