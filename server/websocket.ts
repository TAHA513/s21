import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from './db';

interface WebSocketMessage {
  type: string;
  payload: any;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    logger.info('Initializing WebSocket server');
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('listening', () => {
      logger.info('WebSocket server is listening');
    });

    this.wss.on('connection', (ws: WebSocket, req: Request) => {
      logger.info({
        url: req.url,
        headers: req.headers
      }, 'New WebSocket connection');

      this.clients.add(ws);

      // Send initial connection success message
      this.sendToClient(ws, {
        type: 'connection_status',
        payload: { status: 'connected' }
      });

      ws.on('message', (rawData: string) => {
        try {
          const message = JSON.parse(rawData.toString());
          logger.info({ message }, 'Received WebSocket message');
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error({ error, rawData }, 'Error parsing WebSocket message');
        }
      });

      ws.on('close', () => {
        logger.info('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error({ error }, 'WebSocket error');
        this.clients.delete(ws);
      });
    });

    this.wss.on('error', (error) => {
      logger.error({ error }, 'WebSocket server error');
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong', payload: { time: Date.now() } });
        break;
      default:
        logger.warn({ messageType: message.type }, 'Unknown message type');
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error({ error, message }, 'Error sending message to client');
      }
    }
  }

  public broadcast(message: WebSocketMessage) {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }
}
