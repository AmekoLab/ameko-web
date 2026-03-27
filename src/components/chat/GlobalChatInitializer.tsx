"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { socketService } from "@/src/services/socket.service";
import { fetchInitialConversations, receiveMessage } from "@/src/store/slices/chatSlice";
import { Message } from "@/src/types/chat.types";
import toast from "react-hot-toast";

export default function GlobalChatInitializer() {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  
  // Use a ref so the socket event listener always sees the latest activeConversationId
  // without needing to re-bind the listener on every render or state change.
  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const isConnectedRef = useRef(false);

  // ── Listener Registration ────────────────────────────────
  useEffect(() => {
    // This stable callback won't be re-created thanks to the refs
    const handleNewMessage = (message: Message) => {
      dispatch(receiveMessage(message));
      
      // If it's for a different conversation, trigger a toast
      if (activeIdRef.current !== message.conversationId) {
         toast.success("New message received!");
      }
    };

    socketService.onMessageReceived(handleNewMessage);
    
    // Cleanup the specific handler on unmount
    return () => socketService.offMessageReceived(handleNewMessage);
  }, [dispatch]);

  // ── Connection Lifecycle ─────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : "";
      if (!token) return;

      if (isConnectedRef.current) return;
      isConnectedRef.current = true;

      (async () => {
        try {
          await socketService.connect(token, dispatch);
          dispatch(fetchInitialConversations());
        } catch {
          isConnectedRef.current = false;
        }
      })();
    } else {
      socketService.disconnect();
      isConnectedRef.current = false;
    }

    return () => {
      socketService.disconnect();
      isConnectedRef.current = false;
    };
  }, [isAuthenticated, isInitialized, dispatch]);

  return null;
}
