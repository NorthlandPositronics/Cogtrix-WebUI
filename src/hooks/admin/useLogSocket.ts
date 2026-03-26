import { useCallback, useEffect, useRef } from "react";
import { LogSocket } from "@/lib/api/ws/log-socket";
import type { LogLevel } from "@/lib/api/ws/log-socket";
import { useLogViewerStore } from "@/lib/stores/log-viewer-store";

const getStore = () => useLogViewerStore.getState();

export function useLogSocket() {
  const socketRef = useRef<LogSocket | null>(null);

  function ensureSocket(): LogSocket {
    if (!socketRef.current) {
      socketRef.current = new LogSocket({
        onLogLine: (payload) => getStore().appendLine(payload),
        onOpen: () => getStore().setConnectionStatus("connected"),
        onClose: () => getStore().setConnectionStatus("disconnected"),
        onError: () => getStore().setConnectionStatus("error"),
      });
    }
    return socketRef.current;
  }

  const connect = useCallback((level: LogLevel) => {
    getStore().setConnectionStatus("connecting");
    ensureSocket().connect(level);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    getStore().setConnectionStatus("disconnected");
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { connect, disconnect };
}
