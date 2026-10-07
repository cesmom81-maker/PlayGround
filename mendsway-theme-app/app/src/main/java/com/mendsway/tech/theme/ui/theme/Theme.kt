package com.mendsway.tech.theme.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

private val LightScheme = lightColorScheme(
    primary = Ink,
    onPrimary = Ivory,
    primaryContainer = InkContainer,
    onPrimaryContainer = Ivory,
    secondary = Taupe,
    onSecondary = IvorySurface,
    secondaryContainer = Sand,
    onSecondaryContainer = Ink,
    tertiary = Gold,
    onTertiary = Ink,
    tertiaryContainer = GoldContainer,
    onTertiaryContainer = Ink,
    background = Ivory,
    onBackground = Ink,
    surface = IvorySurface,
    onSurface = Ink,
    surfaceVariant = SandVariant,
    onSurfaceVariant = Taupe,
    outline = Line,
    outlineVariant = Sand,
    error = androidx.compose.ui.graphics.Color(0xFFBA1A1A)
)

private val DarkScheme = darkColorScheme(
    primary = NightPrimary,
    onPrimary = Ink,
    primaryContainer = Sand,
    onPrimaryContainer = Ink,
    secondary = Line,
    onSecondary = Ink,
    secondaryContainer = NightSurfaceVariant,
    onSecondaryContainer = NightOnSurface,
    tertiary = NightGold,
    onTertiary = Ink,
    tertiaryContainer = Taupe,
    onTertiaryContainer = Ivory,
    background = NightBg,
    onBackground = NightOnSurface,
    surface = NightSurface,
    onSurface = NightOnSurface,
    surfaceVariant = NightSurfaceVariant,
    onSurfaceVariant = Line,
    outline = NightLine
)

val MendsWayShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

@Composable
fun MendsWayTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val scheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkScheme
        else -> LightScheme
    }

    MaterialTheme(
        colorScheme = scheme,
        typography = MendsWayTypography,
        shapes = MendsWayShapes,
        content = content
    )
}
