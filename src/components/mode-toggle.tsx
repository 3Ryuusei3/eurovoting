import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useStore } from "@/store/useStore"

export function ModeToggle() {
  const { theme, setTheme } = useStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-0"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
