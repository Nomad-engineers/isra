interface CentrifugoEvent {
  type: string
  data: any
  channel: string
}

interface CentrifugoResponse {
  id: string
  result?: any
  error?: any
}

export class CentrifugoClient {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(wsUrl?: string) {
    this.wsUrl = wsUrl || process.env.NEXT_PUBLIC_CENTRIFUGO_WS_URL || 'wss://ws.nomad-engineers.space/connection/websocket';
  }

  private async connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);

      ws.onopen = () => {
        console.log('Connected to Centrifugo WebSocket');
        this.reconnectAttempts = 0;
        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect();
      };

      this.ws = ws;
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private async ensureConnection(): Promise<WebSocket> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.ws = await this.connect();
    }
    return this.ws;
  }

  public async sendEvent(channel: string, event: Omit<CentrifugoEvent, 'channel'>): Promise<CentrifugoResponse> {
    try {
      const ws = await this.ensureConnection();

      const message = {
        id: this.generateId(),
        method: 'publish',
        params: {
          channel,
          data: {
            ...event,
            channel,
            timestamp: new Date().toISOString(),
          },
        },
      };

      ws.send(JSON.stringify(message));

      return new Promise((resolve) => {
        // For Centrifugo, publish usually doesn't return a response
        // We'll resolve immediately after sending
        resolve({
          id: message.id,
          result: { success: true },
        });
      });
    } catch (error) {
      console.error('Failed to send event to Centrifugo:', error);
      throw error;
    }
  }

  public async broadcastEvent(event: CentrifugoEvent): Promise<CentrifugoResponse[]> {
    const responses: CentrifugoResponse[] = [];

    // Send to specific channel or multiple channels
    const channels = Array.isArray(event.channel) ? event.channel : [event.channel];

    for (const channel of channels) {
      try {
        const response = await this.sendEvent(channel, {
          type: event.type,
          data: event.data,
        });
        responses.push(response);
      } catch (error) {
        console.error(`Failed to send event to channel ${channel}:`, error);
        responses.push({
          id: '',
          error: error,
        });
      }
    }

    return responses;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for common webinar events
  public async sendWebinarSettings(webinarId: string, settings: any): Promise<CentrifugoResponse> {
    return this.sendEvent(`webinar:${webinarId}:settings`, {
      type: 'settings_updated',
      data: {
        webinarId,
        settings,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public async sendWebinarAudioSettings(webinarId: string, muted: boolean): Promise<CentrifugoResponse> {
    return this.sendEvent(`webinar:${webinarId}:audio`, {
      type: 'audio_settings',
      data: {
        webinarId,
        muted,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public async sendWebinarBanner(webinarId: string, bannerSettings: any): Promise<CentrifugoResponse> {
    return this.sendEvent(`webinar:${webinarId}:banner`, {
      type: 'banner_updated',
      data: {
        webinarId,
        bannerSettings,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public async sendWebinarStopped(webinarId: string, stoppedBy?: string): Promise<CentrifugoResponse> {
    return this.sendEvent(`webinar:${webinarId}:control`, {
      type: 'webinar_stopped',
      data: {
        webinarId,
        stoppedBy,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public async sendWebinarChatToggle(webinarId: string, enabled: boolean): Promise<CentrifugoResponse> {
    return this.sendEvent(`webinar:${webinarId}:chat`, {
      type: 'chat_toggled',
      data: {
        webinarId,
        enabled,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Export singleton instance
export const centrifugoClient = new CentrifugoClient();