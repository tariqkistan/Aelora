"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import LanguageSelector from "@/components/LanguageSelector"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const t = useTranslations('common')
  
  const navItems = [
    { name: t('appName'), href: "/" },
    { name: t('analyze'), href: "/analyzer" },
    { name: t('dashboard'), href: "/visibility" },
    { name: "Compare", href: "/compare" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter">{t('appName')}</span>
          </Link>
          <nav className="hidden md:flex md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button asChild variant="default" size="sm">
              <Link href="/analyzer">
                {t('analyze')}
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
} 