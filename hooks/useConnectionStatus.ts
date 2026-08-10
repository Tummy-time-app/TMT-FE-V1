export type ConnectionStatus = "connected" | "reconnecting" | "offline";

/**
 * Reflects the realtime transport's connection state — spec §21/§49 want
 * a visible "● Live / ○ Reconnecting… / ○ Offline" indicator wherever
 * realtime data is shown. Always "connected" in dev-mock mode since
 * there's no real socket to drop; once a Supabase Realtime/WebSocket
 * channel exists, wire its connect/disconnect events in here — every
 * consumer already expects this exact three-state shape.
 */
export function useConnectionStatus(): ConnectionStatus {
  return "connected";
}
