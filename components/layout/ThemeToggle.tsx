"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

const subscribeNoop = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // O tema só é conhecido no navegador: falso no servidor e na hidratação, verdadeiro depois.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const t = useTranslations("theme");

  if (!mounted) {
    return <div className="h-10 w-10" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? t("toggle_light") : t("toggle_dark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon className="h-[18px] w-[18px]" aria-hidden /> : <Sun className="h-[18px] w-[18px]" aria-hidden />}
    </Button>
  );
}
