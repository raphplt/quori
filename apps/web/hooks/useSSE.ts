"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";

interface UseSSEOptions {
  endpoint: string;
  events: string[];
  maxReconnectAttempts?: number;
  onMessage?: (event: string, data: any) => void;
  onConnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseSSEReturn {
  isConnected: boolean;
  error: Error | null;
  sendMessage: (event: string, data: any) => void;
}

/**
 * Hook utilitaire pour gérer les connexions SSE de manière centralisée
 */
export function useSSE({
  endpoint,
  events,
  maxReconnectAttempts = 3,
  onMessage,
  onConnect,
  onError,
}: UseSSEOptions): UseSSEReturn {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (!session?.apiToken) {
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const url = `${baseUrl}${endpoint}?token=${session.apiToken}`;

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`🔗 SSE connected to ${endpoint}`);
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    };

    // Écouter les événements spécifiés
    events.forEach(eventName => {
      eventSource.addEventListener(eventName, event => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(eventName, data);
        } catch (err) {
          console.error(`Error parsing SSE ${eventName} event:`, err);
        }
      });
    });

    eventSource.onerror = err => {
      console.error(`SSE error for ${endpoint}:`, err);
      setIsConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        );
        reconnectAttemptsRef.current++;

        console.log(
          `🔄 Reconnecting SSE ${endpoint} in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, delay);
      } else {
        const error = new Error("Max reconnection attempts reached");
        setError(error);
        onError?.(error);
      }
    };
  }, [
    endpoint,
    events,
    maxReconnectAttempts,
    onMessage,
    onConnect,
    onError,
    session?.apiToken,
  ]);

  const sendMessage = useCallback((event: string, data: any) => {
    // Pour SSE, on ne peut pas envoyer de messages depuis le client
    // Cette fonction est là pour la compatibilité avec d'autres patterns
    console.warn("SSE does not support sending messages from client");
  }, []);

  useEffect(() => {
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connectSSE]);

  return {
    isConnected,
    error,
    sendMessage,
  };
}
