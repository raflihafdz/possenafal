"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "system" ? undefined : theme}
      position="top-right"
      richColors
      closeButton
      duration={3000}
    />
  );
}
