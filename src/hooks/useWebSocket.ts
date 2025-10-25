import { useState, useEffect, useRef } from 'react';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('rolActual') === 'ADMINISTRATOR';
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Conectado al WebSocket');
      setIsConnected(true);

      const userId = localStorage.getItem('user_uuid');
      console.log('Enviando REGISTER con userId:', userId); // Verifica que no sea undefined

      if (userId) {
        if (isAdmin) {
          ws.send(JSON.stringify({ type: 'REGISTER_ADMIN', userId }));
        } else {
          ws.send(JSON.stringify({ type: 'REGISTER', userId }));
          // Pedir lista de usuarios conectados
          ws.send(JSON.stringify({ type: 'GET_CONNECTED_USERS' }));
        }
      } else {
        console.error('userId es undefined, no se envía REGISTER');
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'FORCE_LOGOUT':
          localStorage.removeItem('user_uuid');
          localStorage.removeItem('token');
          alert('Tu sesión ha sido cerrada por un administrador.');
          window.location.href = '/login';
          break;

        case 'REFRESH_LEADS':
          if (window.refreshKanban) {
            window.refreshKanban();
          } else {
            location.reload();
          }
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
          console.log('Mensaje desconocido:', data);
      }
    };

    ws.onclose = () => {
      console.log('Desconectado del WebSocket');
      setIsConnected(false);
      setConnectedUsers([]);
      setOnlineUsers([]);
      // Opcional: intentar reconectar
      // setTimeout(() => { /* reconectar */ }, 5000);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { isConnected, connectedUsers, onlineUsers, sendMessage };
};