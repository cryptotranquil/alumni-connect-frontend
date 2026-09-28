import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getSocketBaseUrl } from "../lib/socketUrl";
import { SocketContext } from "./SocketContextValue";

/** Fired on connection-related socket events so sidebars can refetch counts. */
export const AC_SOCKET_EVENT = "ac-socket";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    const s = io(getSocketBaseUrl(), {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = s;
    queueMicrotask(() => {
      if (socketRef.current === s) {
        setSocket(s);
      }
    });

    const notify = () => window.dispatchEvent(new Event(AC_SOCKET_EVENT));

    // Connection events
    s.on("connection:incoming", notify);
    s.on("connection:accepted", notify);
    s.on("connection:rejected", notify);

    // NEW: Notification events
    s.on("notification:new", (data) => {
      // Dispatch a custom event for notification updates
      window.dispatchEvent(
        new CustomEvent("notification:new", { detail: data }),
      );
    });

    s.on("notification:read", (data) => {
      window.dispatchEvent(
        new CustomEvent("notification:read", { detail: data }),
      );
    });

    return () => {
      socketRef.current = null;
      s.off("connection:incoming", notify);
      s.off("connection:accepted", notify);
      s.off("connection:rejected", notify);
      s.off("notification:new");
      s.off("notification:read");
      s.disconnect();
      setSocket(null);
    };
  }, [user?.token]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export default SocketProvider;
