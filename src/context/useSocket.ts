import { useContext } from "react";
import { SocketContext } from "./SocketContextValue";

export function useSocket() {
  return useContext(SocketContext);
}

export default useSocket;
