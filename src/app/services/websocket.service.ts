import { Injectable } from "@angular/core";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs"; // Import StompSubscription
import {BehaviorSubject} from "rxjs";
import {environment} from "../../environments/environment";
import {ProgressMessage} from "../models/analysis-result.model";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private connected = new BehaviorSubject<boolean>(false);
  private subscriptions = new Map<string, StompSubscription>(); // Track subscriptions with StompSubscription type

  constructor() {
    this.client = new Client({
      brokerURL: `${environment.wsUrl.replace('http', 'ws')}/ws-progress/websocket`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: msg => console.log('[STOMP]', msg),
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connected.next(true);
        this.subscriptions.forEach((_subscription, fileId) => {});
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.connected.next(false);
      },
      onStompError: frame => console.error('STOMP error', frame.headers['message'], frame.body),
    });

    this.client.activate();
  }

  // New method to check if a fileId is currently subscribed
  isSubscribed(fileId: string): boolean {
    return this.subscriptions.has(fileId);
  }

  subscribeToProgress(fileId: string, callback: (progress: ProgressMessage) => void): void {
    if (!fileId) {
      console.error('Cannot subscribe to progress: fileId is undefined');
      return;
    }

    if (this.isSubscribed(fileId)) {
      console.log(`Already subscribed to progress for fileId: ${fileId}. Skipping.`);
      return; // Do not re-subscribe if already active
    }

    const subscribeAction = () => {
      if (!this.client.connected) {
        console.log(`WebSocket not connected for file ${fileId}, retrying subscription...`);
        setTimeout(subscribeAction, 500); // Retry until connected
        return;
      }

      console.log(`Attempting to subscribe to /topic/progress/${fileId}`);
      const subscription = this.client.subscribe(`/topic/progress/${fileId}`, (message: IMessage) => {
        try {
          const progress: ProgressMessage = JSON.parse(message.body);
          callback(progress);

          // Auto-unsubscribe logic moved to an NGRX effect for better state management
          // if (progress.status === 'COMPLETED' || progress.status === 'CANCELLED') {
          //   this.unsubscribeFromProgress(fileId);
          // }
        } catch (e) {
          console.error(`Failed to parse progress message for file ${fileId}`, e);
        }
      });

      // Store subscription for potential manual unsubscribe
      this.subscriptions.set(fileId, subscription);
      console.log(`Subscribed to /topic/progress/${fileId}. Active subscriptions: ${this.subscriptions.size}`);

      // Notify the server we are interested in updates for this fileId
      this.client.publish({ destination: `/app/progress/subscribe/${fileId}`, body: '' });
    };

    subscribeAction(); // Start the subscription process
  }

  unsubscribeFromProgress(fileId: string): void {
    const subscription = this.subscriptions.get(fileId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(fileId);
      console.log(`Unsubscribed from progress updates for file: ${fileId}. Remaining subscriptions: ${this.subscriptions.size}`);
    } else {
      console.log(`No active subscription found for file: ${fileId} to unsubscribe.`);
    }
  }

  cancelProcessing(fileId: string): void {
    if (this.client.connected && fileId) {
      this.client.publish({ destination: `/app/progress/cancel/${fileId}`, body: '' });
      console.log(`Sent cancel request for file: ${fileId}`);
    } else {
      console.warn(`Cannot send cancel request for file ${fileId}. WebSocket not connected or fileId missing.`);
    }
  }

  isConnected() {
    return this.connected.asObservable();
  }

  disconnect(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe()); // Unsubscribe all
    this.subscriptions.clear();
    if (this.client.active) {
      this.client.deactivate();
      console.log('WebSocket explicitly deactivated.');
    }
  }
}
