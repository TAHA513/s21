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

interface WebSocketConfig {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number;
  private reconnectInterval: number;
  private reconnectTimeout: number = 0;
  private maxReconnectTimeout: number = 30000; // 30 seconds
  private currentAttempt: number = 0;
  private onMessage?: (data: any) => void;
  private onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

  constructor(config: WebSocketConfig = {}) {
    this.reconnectAttempts = config.reconnectAttempts ?? 5;
    this.reconnectInterval = config.reconnectInterval ?? 1000;
    this.onMessage = config.onMessage;
    this.onStatusChange = config.onStatusChange;
    this.connect();
  }

  private connect() {
    try {
      if (this.ws) {
        this.ws.close();
      }

      this.updateStatus('connecting');
      const wsUrl = getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      // Connection timeout handler
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout');
          this.ws.close();
        }
      }, 5000);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connection established successfully');
        this.currentAttempt = 0;
        this.reconnectTimeout = this.reconnectInterval;
        this.updateStatus('connected');
      };

      this.ws.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data);
        if (this.onMessage) {
          try {
            const data = JSON.parse(event.data);
            this.onMessage(data);
          } catch (error) {
            this.onMessage(event.data);
          }
        }
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.updateStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        this.updateStatus('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.updateStatus('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.currentAttempt >= this.reconnectAttempts) {
      console.log('Maximum reconnection attempts reached');
      return;
    }

    this.currentAttempt++;
    const timeout = Math.min(this.reconnectTimeout * Math.pow(2, this.currentAttempt - 1), this.maxReconnectTimeout);

    console.log(`Attempting to reconnect in ${timeout}ms (attempt ${this.currentAttempt}/${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  private updateStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error') {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  public send(data: string | object) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  public close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}