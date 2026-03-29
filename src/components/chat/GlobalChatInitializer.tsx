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
  const conversationsInitialized = useAppSelector((state) => state.chat.conversationsInitialized);
  const isLoadingConversations = useAppSelector((state) => state.chat.isLoadingConversations);

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
    const handleNewMessage = (message: Message) => {
      dispatch(receiveMessage(message));
      if (activeIdRef.current !== message.conversationId) {
        toast.success("New message received!");
      }
    };
    socketService.onMessageReceived(handleNewMessage);
    return () => socketService.offMessageReceived(handleNewMessage);
  }, [dispatch]);

  // ── Step 1: Fetch conversations immediately on auth-ready ────────────────
  // This is decoupled from the socket so the UI hydrates fast on every page
  // load / reload, even before the WebSocket is established.
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    if (conversationsInitialized || isLoadingConversations) return;
    dispatch(fetchInitialConversations());
  }, [isInitialized, isAuthenticated, conversationsInitialized, isLoadingConversations, dispatch]);

  // ── Step 2: Connect socket & join SignalR groups ─────────────────────────
  // Runs independently after auth is confirmed. Once connected, joins all
  // existing conversation groups so real-time messages are delivered.
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
          // After connecting, join all conversation groups. We read the slice
          // state via a one-time selector result — the fetch may have already
          // finished by the time the socket connects.
          const result = await dispatch(fetchInitialConversations());
          const conversations =
            (result.payload as { conversationId: number }[] | undefined) ?? [];
          await Promise.all(
            conversations.map((c) =>
              socketService.joinConversation(c.conversationId.toString()),
            ),
          );
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

  // ── Join group whenever a conversation is newly opened ───────────────────
  useEffect(() => {
    if (activeConversationId == null) return;
    socketService
      .joinConversation(activeConversationId.toString())
      .catch((err) =>
        console.warn("[GlobalChatInitializer] joinConversation failed:", err),
      );
  }, [activeConversationId]);

  return null;
}
