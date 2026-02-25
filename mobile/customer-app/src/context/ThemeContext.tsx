import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getColorsByScheme, getTypographyByScheme } from "../theme/tokens"
import type { ColorScheme } from "../theme/tokens"

export type ThemeMode = "system" | "light" | "dark"

interface ThemeContextValue {
    themeMode: ThemeMode
    setThemeMode: (mode: ThemeMode) => void
    colorScheme: ColorScheme
    colors: ReturnType<typeof getColorsByScheme>
    typography: ReturnType<typeof getTypographyByScheme>
}

const STORAGE_KEY = "@varto_theme"

const defaultColors = getColorsByScheme("light")
const defaultTypography = getTypographyByScheme("light")

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: "system",
    setThemeMode: () => { },
    colorScheme: "light",
    colors: defaultColors,
    typography: defaultTypography,
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

    // Memoize colors and typography so they change only when colorScheme changes
    const colors = useMemo(() => getColorsByScheme(colorScheme), [colorScheme])
    const typography = useMemo(() => getTypographyByScheme(colorScheme), [colorScheme])

    const value = useMemo<ThemeContextValue>(() => ({
        themeMode,
        setThemeMode,
        colorScheme,
        colors,
        typography,
    }), [themeMode, setThemeMode, colorScheme, colors, typography])

    return (
        <ThemeContext.Provider value={value}>
            {loaded ? children : null}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)

// Convenience hook — components that only need colors
export const useColors = () => useContext(ThemeContext).colors
export const useTypography = () => useContext(ThemeContext).typography
