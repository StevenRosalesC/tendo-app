import { useAuth } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getWsBaseUrl } from "../services/api";
import { SaleCreatedEvent, StockUpdatedEvent } from "../types/auth.types";

export interface UsePosSocketOptions {
  onStockUpdated?: (event: StockUpdatedEvent) => void;
  onSaleCreated?: (event: SaleCreatedEvent) => void;
}

export function usePosSocket(options: UsePosSocketOptions = {}) {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!isSignedIn) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let socket: Socket | null = null;
    let isMounted = true;

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        const wsUrl = getWsBaseUrl();

        socket = io(wsUrl, {
          transports: ["websocket"],
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
        });

        socket.on("connect", () => {
          if (!isMounted) return;
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          if (!isMounted) return;
          setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
          if (!isMounted) return;
          setIsConnected(false);
          console.warn("[POS WebSocket] Connection error:", error.message);
        });

        // Event 1: stock:updated -> Update products cache in TanStack Query
        socket.on("stock:updated", (data: StockUpdatedEvent) => {
          if (!isMounted) return;

          // Mutate local cache in TanStack Query for products if available
          queryClient.setQueryData<any[]>(["products"], (oldProducts) => {
            if (!oldProducts) return oldProducts;
            return oldProducts.map((p) =>
              p.id === data.productId ? { ...p, stock: data.newStock } : p,
            );
          });

          // Invalidate to guarantee full consistency
          queryClient.invalidateQueries({ queryKey: ["products"] });

          options.onStockUpdated?.(data);
        });

        // Event 2: sale:created -> Invalidate sales history cache
        socket.on("sale:created", (data: SaleCreatedEvent) => {
          if (!isMounted) return;

          queryClient.invalidateQueries({ queryKey: ["sales"] });
          options.onSaleCreated?.(data);
        });

        socketRef.current = socket;
      } catch (err) {
        console.warn("[POS WebSocket] Setup error:", err);
      }
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isSignedIn]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

export default usePosSocket;
