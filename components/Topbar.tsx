"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchPlayers } from "@/app/players/actions"

export function Topbar() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [isFocused, setIsFocused] = React.useState(false)

  // Use a ref to handle clicks outside the search results
  const searchContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-search when query changes
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (query.trim().length > 1) {
      timeoutId = setTimeout(async () => {
        const players = await searchPlayers(query.trim())
        setResults(players)
      }, 300) // Debounce 300ms
    } else {
      setResults([])
    }
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/players?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
    } else {
      router.push(`/players`)
    }
  }

  const handlePlayerClick = (playerId: string) => {
    router.push(`/players/${playerId}/profile`)
    setIsFocused(false)
    setQuery("")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 bg-bg-primary border-b border-border-dark text-text-primary">
      <div className="flex flex-1 items-center gap-4">
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              type="search"
              placeholder="Zoek spelers..."
              className="w-full bg-bg-card border-none focus-visible:ring-1 focus-visible:ring-accent-primary text-text-primary placeholder:text-text-muted pl-9 md:w-[300px] lg:w-[400px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
          </form>

          {/* Search Results Dropdown */}
          {isFocused && query.trim().length > 1 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-bg-card border border-border-dark rounded-md shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <ul className="py-2">
                  {results.map((player) => (
                    <li 
                      key={player.id} 
                      className="px-4 py-2 hover:bg-bg-hover cursor-pointer flex flex-col"
                      onClick={() => handlePlayerClick(player.id)}
                    >
                      <span className="font-medium text-sm text-text-primary flex items-center gap-2">
                        <User className="h-3 w-3 text-text-muted" />
                        {player.name}
                      </span>
                      <span className="text-xs text-text-secondary ml-5">
                        {player.currentClub || 'Geen club'} • {player.position || 'Geen positie'}
                      </span>
                    </li>
                  ))}
                  <li className="px-4 py-2 border-t border-border-dark mt-1">
                    <button 
                      onClick={handleSearch}
                      className="text-xs text-accent-primary hover:text-accent-glow"
                    >
                      Bekijk alle resultaten voor "{query}"...
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-sm text-text-muted text-center">
                  Geen spelers gevonden.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Optionele toekomstige acties kunnen hier */}
      </div>
    </header>
  )
}
