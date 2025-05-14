import { store } from './store';
import { missionActions, telemetryActions, missionLogActions } from './store';

let socket: WebSocket | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.hostname;
    let port = window.location.port;
    let wsPort = port;
    // If running in development (Vite), use backend port if specified
    if (import.meta && import.meta.env && import.meta.env.VITE_WS_PORT) {
      wsPort = import.meta.env.VITE_WS_PORT;
      console.log('[WebSocket] Using VITE_WS_PORT from env:', wsPort);
    } else if (!wsPort || wsPort === "") {
      wsPort = protocol === "wss:" ? "443" : "80";
      console.log('[WebSocket] No port detected, using default for protocol:', wsPort);
    }
    // If running on localhost and frontend is on 3000, default backend to 5000
    if (host === "localhost" && port === "3000") {
      wsPort = "5000";
      console.log('[WebSocket] Detected localhost:3000, using backend port 5000');
    }
    const wsUrl = `${protocol}//${host}:${wsPort}/ws`;
    console.log('[WebSocket] Attempting connection to:', wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[WebSocket] Connection established:', wsUrl);
      reconnectAttempts = 0;
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error, event.data);
      }
    };

    socket.onclose = (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason, wsUrl);
      socket = null;

      // Attempt to reconnect if not closed cleanly and haven't reached max attempts
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectInterval = setInterval(() => {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          initializeWebSocket();

          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            if (reconnectInterval) {
              clearInterval(reconnectInterval);
              reconnectInterval = null;
              console.error('Max reconnect attempts reached');
            }
          }
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error event:', error, wsUrl);
    };

    return socket;
  } catch (error) {
    console.error('[WebSocket] Exception during initialization:', error);
    return null;
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }

  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
};

export const sendWebSocketMessage = (message: any) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = initializeWebSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not open');
      return false;
    }
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

export const subscribeMission = (missionId: number) => {
  return sendWebSocketMessage({
    type: 'subscribe:mission',
    missionId
  });
};

export const unsubscribeMission = (missionId: number) => {
  return sendWebSocketMessage({
    type: 'unsubscribe:mission',
    missionId
  });
};

export const sendTelemetryUpdate = (telemetry: any, actualPath?: any) => {
  return sendWebSocketMessage({
    type: 'telemetry:update',
    telemetry,
    actualPath
  });
};

const handleWebSocketMessage = (message: any) => {
  switch (message.type) {
    case 'missions:active':
      store.dispatch(missionActions.setActiveMissions(message.missions));
      break;

    case 'mission:update':
      if (message.mission) {
        store.dispatch(missionActions.updateMission(message.mission));
      }
      break;
      
    case 'mission:started':
      if (message.missionId) {
        // Refresh mission lists when a new mission is started
        fetch('/api/missions')
          .then(res => res.json())
          .then(missions => {
            store.dispatch(missionActions.setMissions(missions));
          });
        fetch('/api/missions/active')
          .then(res => res.json())
          .then(missions => {
            store.dispatch(missionActions.setActiveMissions(missions));
          });
      }
      break;

    case 'telemetry:update':
      if (message.telemetry) {
        store.dispatch(telemetryActions.addTelemetry(message.telemetry));
      }
      break;
      
    case 'drone:update':
      if (message.drone) {
        // This will update a drone in the store
        fetch('/api/drones')
          .then(res => res.json())
          .then(drones => {
            store.dispatch({ type: 'drones/setDrones', payload: drones });
          });
      }
      break;

    case 'mission:log':
      if (message.log) {
        store.dispatch(missionLogActions.addMissionLog(message.log));
      }
      break;

    case 'error':
      console.error('WebSocket error:', message.message);
      break;

    default:
      console.log('Unknown WebSocket message type:', message.type);
  }
};
