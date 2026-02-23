import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Appearance, useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type ThemeMode = "system" | "light" | "dark"
export type ColorScheme = "light" | "dark"

interface ThemeContextValue {
    themeMode: ThemeMode
    setThemeMode: (mode: ThemeMode) => void
    colorScheme: ColorScheme
}

const STORAGE_KEY = "@varto_theme"

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: "system",
    setThemeMode: () => { },
    colorScheme: "light",
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme()
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system")
    const [loaded, setLoaded] = useState(false)

    // Load saved preference
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val === "light" || val === "dark" || val === "system") {
                setThemeModeState(val)
            }
            setLoaded(true)
        })
    }, [])

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode)
        await AsyncStorage.setItem(STORAGE_KEY, mode)
    }, [])

    // Resolve effective color scheme
    const colorScheme: ColorScheme =
        themeMode === "system"
            ? (systemScheme || "light")
            : themeMode

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, colorScheme }}>
            {loaded ? children : null}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
