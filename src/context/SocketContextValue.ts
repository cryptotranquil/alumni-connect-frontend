import { createContext } from "react";
import type { Socket } from "socket.io-client";

export type SocketContextValue = { socket: Socket | null };

export const SocketContext = createContext<SocketContextValue>({ socket: null });

export type NotificationEventType =
  | "notification:new"
  | "notification:read"
  | "notification:deleted";

export default SocketContext;
