type AlertCallback = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: AlertCallback[] = [];
  public isConnected: boolean = false;
  private reconnectInterval: any = null;

  public connect() {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${hostname}:8000/ws/security`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[ABHAYA WSS] Connected to Security Gateway (${wsUrl})`);
        this.isConnected = true;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_SECURITY_ALERT' || data.type === 'NEW_THREAT_ALERT' || data.alert_type === 'SOS') {
            this.playAlertSound();
            this.showBrowserNotification(data);
          }
          this.notifyListeners(data);
        } catch (e) {
          console.error('[ABHAYA WSS] Parse error:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.warn('[ABHAYA WSS] Disconnected. Reconnecting in 2s...');
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: false });
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(() => this.connect(), 2000);
        }
      };

      this.socket.onerror = (err) => {
        console.error('[ABHAYA WSS] Error:', err);
        this.isConnected = false;
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: false });
      };
    } catch (e) {
      console.error('[ABHAYA WSS] Connection init error:', e);
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((callback) => callback(data));
  }

  public subscribe(callback: AlertCallback) {
    this.listeners.push(callback);
    // Notify immediately with current status
    callback({ type: 'CONNECTION_CHANGE', isConnected: this.isConnected });
    
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public playAlertSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio policy
    }
  }

  public showBrowserNotification(data: any) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(`🚨 NoCode SOS ALERT [${data.alert_type || 'SOS'}]`, {
        body: `Device: ${data.device_id || 'PHONE-001'} | Lat: ${data.latitude} | Lng: ${data.longitude}`,
        icon: '/shield.svg'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
}

export const wsClient = new WebSocketClient();
