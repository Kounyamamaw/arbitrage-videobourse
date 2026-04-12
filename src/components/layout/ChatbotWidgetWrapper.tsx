"use client";

import { usePathname } from "next/navigation";
import { ChatbotWidget } from "./ChatbotWidget";

const HIDDEN_PATHS = ["/dashboard/admin", "/dashboard/conseiller-ia"];

export function ChatbotWidgetWrapper() {
  const pathname = usePathname();
  const hidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (hidden) return null;
  return <ChatbotWidget />;
}
