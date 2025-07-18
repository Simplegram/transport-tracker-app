import { useTheme } from "@/context/ThemeContext"
import { colors } from "@/src/const/color"
import { PropsWithChildren, useEffect, useState } from "react"
import { Keyboard, StyleSheet, Text, useWindowDimensions, View } from "react-native"

export function EmptyHeaderComponent({ children }: PropsWithChildren) {
    const { height, width } = useWindowDimensions()

    const [keyboardShown, setKeyboardShown] = useState<boolean>(false)

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardShown(true)
        })
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardShown(false)
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    const maxMinHeight = height * 0.4
    const minHeight = height * 0.1

    return (
        <View style={{
            flex: 1,
            height: keyboardShown ? minHeight : maxMinHeight,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {children}
        </View>
    )
}

interface TravelHeaderProps {
    index: number
    directionNameKey: string
    directionNamesLength: number
}

export function Header({ index, directionNameKey, directionNamesLength }: TravelHeaderProps) {
    const { theme } = useTheme()

    return (
        <View
            style={{
                gap: 5,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text style={styles[theme].title}>
                Direction ({index + 1}/{directionNamesLength}):
            </Text>
            <Text style={styles[theme].title}>
                {directionNameKey}
            </Text>
        </View>
    )
}

const lightStyles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50'
    },
})

const styles = {
    light: { ...lightStyles, label: lightStyles.title },
    dark: StyleSheet.create({
        title: {
            ...lightStyles.title,
            color: colors.white_300,
        },
        label: {
            ...lightStyles.title,
            color: colors.white_100,
        },
    })
}