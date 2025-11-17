import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const dispatchBrowserEvent = useCallback((eventName: string, detail?: unknown) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }, []);

  const handleRefreshLeads = useCallback(
    (detail?: unknown) => {
      dispatchBrowserEvent('ws:refresh-leads', detail);

      if (typeof window === 'undefined') {
        return;
      }

      if (typeof window.refreshKanban === 'function') {
        window.refreshKanban();
      } else {
        window.location.reload();
      }
    },
    [dispatchBrowserEvent]
  );

  const handleRealtimeEvent = useCallback(
    (detail: unknown) => {
      dispatchBrowserEvent('ws:realtime-event', detail);
    },
    [dispatchBrowserEvent]
  );

  useEffect(() => {

    const isAdmin = localStorage.getItem('rolActual') === 'ADMINISTRATOR';
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      const userId = localStorage.getItem('user_uuid');

      if (userId) {
        if (isAdmin) {
          ws.send(JSON.stringify({ type: 'REGISTER_ADMIN', userId }));
        } else {
          ws.send(JSON.stringify({ type: 'REGISTER', userId }));
          // Pedir lista de usuarios conectados
          ws.send(JSON.stringify({ type: 'GET_CONNECTED_USERS' }));
        }
      }
    };

    ws.onmessage = (event) => {
      let data: any;

      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error('No se pudo parsear el mensaje WebSocket:', error);
        return;
      }

      switch (data.type) {
        case 'FORCE_LOGOUT':
          localStorage.removeItem('user_uuid');
          localStorage.removeItem('token');
          alert('Tu sesión ha sido cerrada por un administrador.');
          window.location.href = '/login';
          break;

        case 'FORCE_PAGE_RELOAD':
          window.location.reload();
          break;

        case 'REFRESH_LEADS':
        case 'REQUEST_REFRESH':
          handleRefreshLeads(data.payload);
          break;

        case 'REALTIME_EVENT':
        case 'BROADCAST_EVENT':
          handleRealtimeEvent(data);
          break;

        case 'CONNECTED_USERS':
          setConnectedUsers(data.users || []);
          break;

        case 'USER_STATUS_UPDATE':
          // Actualizar lista de usuarios conectados en tiempo real
          setConnectedUsers(data.users || []);
          break;

        case 'CURRENT_ONLINE_LIST':
          if (isAdmin) {
            setOnlineUsers(data.onlineUserIds || []);
          }
          break;

        case 'USER_STATUS_CHANGE':
          if (isAdmin) {
            setOnlineUsers(prev => {
              const newList = [...prev];
              if (data.status === 'ONLINE') {
                if (!newList.includes(data.userId)) {
                  newList.push(data.userId);
                }
              } else if (data.status === 'OFFLINE') {
                const index = newList.indexOf(data.userId);
                if (index > -1) {
                  newList.splice(index, 1);
                }
              }
              return newList;
            });
          }
          break;

        default:
          // Mensaje desconocido, ignorar
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectedUsers([]);
      setOnlineUsers([]);
      // Opcional: intentar reconectar
      // setTimeout(() => { /* reconectar */ }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [handleRefreshLeads, handleRealtimeEvent]);

  const requestRefresh = useCallback(
    (options: { excludeSender?: boolean } = {}) => {
      const { excludeSender = true } = options;
      sendMessage({ type: 'REQUEST_REFRESH', excludeSender });
    },
    [sendMessage]
  );

  const triggerGlobalReload = useCallback(
    (options: { reason?: string; excludeSender?: boolean } = {}) => {
      const { reason, excludeSender = false } = options;
      sendMessage({
        type: 'TRIGGER_GLOBAL_RELOAD',
        reason: reason ?? 'Actualización global solicitada',
        excludeSender,
      });
    },
    [sendMessage]
  );

  const broadcastEvent = useCallback(
    (eventName: string, payload?: unknown, excludeSender = true) => {
      sendMessage({
        type: 'BROADCAST_EVENT',
        event: eventName,
        payload,
        excludeSender,
      });
    },
    [sendMessage]
  );

  return {
    isConnected,
    connectedUsers,
    onlineUsers,
    sendMessage,
    requestRefresh,
    triggerGlobalReload,
    broadcastEvent,
  };
};