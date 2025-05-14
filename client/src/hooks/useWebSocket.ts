import { useEffect, useCallback } from 'react';
import { initializeWebSocket, closeWebSocket, subscribeMission, unsubscribeMission, sendWebSocketMessage } from '@/lib/websocket';

export function useWebSocket() {
  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    const socket = initializeWebSocket();
    
    // Clean up WebSocket connection when component unmounts
    return () => {
      closeWebSocket();
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    return sendWebSocketMessage(message);
  }, []);

  const subscribeMissionUpdates = useCallback((missionId: number) => {
    return subscribeMission(missionId);
  }, []);

  const unsubscribeMissionUpdates = useCallback((missionId: number) => {
    return unsubscribeMission(missionId);
  }, []);

  return {
    sendMessage,
    subscribeMissionUpdates,
    unsubscribeMissionUpdates
  };
}
