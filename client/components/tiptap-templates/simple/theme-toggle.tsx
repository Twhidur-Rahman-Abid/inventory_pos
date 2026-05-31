"use client";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";

// --- Icons ---
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon";
import { SunIcon } from "@/components/tiptap-icons/sun-icon";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [islightMode, setIslightMode] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => setIslightMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const initiallightMode =
      !!document.querySelector('meta[name="color-scheme"][content="light"]') ||
      window.matchMedia("(prefers-color-scheme: light)").matches;
    setIslightMode(initiallightMode);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", islightMode);
  }, [islightMode]);

  const togglelightMode = () => setIslightMode((islight) => !islight);

  return (
    <Button
      onClick={togglelightMode}
      aria-label={`Switch to ${islightMode ? "light" : "light"} mode`}
      variant="ghost"
    >
      {islightMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  );
}
