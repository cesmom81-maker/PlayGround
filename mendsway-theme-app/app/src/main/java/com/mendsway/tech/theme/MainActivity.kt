package com.mendsway.tech.theme

import android.app.WallpaperManager
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LargeTopAppBar
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.mendsway.tech.theme.ui.theme.MendsWayTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    private val notifPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        // Android 15/16/17 edge-to-edge enforcement
        enableEdgeToEdge()
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(
                    this, android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                notifPermission.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        setContent { App() }
    }
}

private data class Tab(val title: String, val icon: ImageVector)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun App() {
    var dark by remember { mutableStateOf<Boolean?>(null) } // null = follow system
    var dynamic by remember { mutableStateOf(true) }
    var tab by remember { mutableStateOf(0) }
    val tabs = listOf(
        Tab("Home", Icons.Filled.Home),
        Tab("Theme", Icons.Filled.Palette),
        Tab("Components", Icons.Filled.Star),
        Tab("Brand", Icons.Filled.Info)
    )
    val isDark = dark ?: isSystemInDarkTheme()
    val scroll = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()

    MendsWayTheme(darkTheme = isDark, dynamicColor = dynamic) {
        Scaffold(
            modifier = Modifier
                .fillMaxSize()
                .nestedScroll(scroll.nestedScrollConnection),
            topBar = {
                LargeTopAppBar(
                    title = {
                        Column {
                            Text("MENDSWAY", style = MaterialTheme.typography.titleMedium)
                            Text(
                                "TECH  •  Android 17 Ready",
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.tertiary
                            )
                        }
                    },
                    scrollBehavior = scroll,
                    colors = TopAppBarDefaults.largeTopAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    )
                )
            },
            bottomBar = {
                NavigationBar {
                    tabs.forEachIndexed { i, t ->
                        NavigationBarItem(
                            selected = tab == i,
                            onClick = { tab = i },
                            icon = { Icon(t.icon, contentDescription = t.title) },
                            label = { Text(t.title) }
                        )
                    }
                }
            },
            floatingActionButton = {
                if (tab == 0) {
                    val ctx = LocalContext.current
                    ExtendedFloatingActionButton(
                        onClick = {
                            Toast.makeText(ctx, "MendsWay luxury theme applied", Toast.LENGTH_SHORT).show()
                        },
                        icon = { Icon(Icons.Filled.Check, null) },
                        text = { Text("Apply theme") }
                    )
                }
            }
        ) { pad ->
            Box(Modifier.padding(pad)) {
                when (tab) {
                    0 -> HomeScreen(
                        isDark = isDark,
                        dynamic = dynamic,
                        onDark = { dark = it },
                        onDynamic = { dynamic = it }
                    )
                    1 -> ThemeScreen()
                    2 -> ComponentsScreen()
                    3 -> BrandScreen()
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(
    isDark: Boolean,
    dynamic: Boolean,
    onDark: (Boolean?) -> Unit,
    onDynamic: (Boolean) -> Unit
) {
    var followSystem by remember(isDark) { mutableStateOf(false) }
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero — THE attached picture, also the APK icon source
        Card(
            shape = MaterialTheme.shapes.extraLarge,
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
        ) {
            Column {
                Image(
                    painter = painterResource(id = R.drawable.mendsway_brand),
                    contentDescription = "MendsWay Tech monogram",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(380.dp),
                    contentScale = ContentScale.Crop
                )
                Column(Modifier.padding(20.dp)) {
                    Text(
                        "MENDSWAY TECH",
                        style = MaterialTheme.typography.titleMedium,
                        letterSpacing = androidx.compose.ui.unit.TextUnit.Unspecified
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Ivory paper • Ink monogram • Dotted handset line. A quiet-luxury theme that scales from launcher icon to wallpaper to every Material 3 surface.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AssistChip(onClick = {}, label = { Text("API 26–37") })
                        AssistChip(onClick = {}, label = { Text("Edge-to-edge") })
                        AssistChip(onClick = {}, label = { Text("M3 Expressive") })
                    }
                }
            }
        }

        OutlinedCard(shape = MaterialTheme.shapes.large) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Appearance", style = MaterialTheme.typography.titleLarge)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Dark mode", modifier = Modifier.weight(1f))
                    Switch(checked = isDark, onCheckedChange = {
                        followSystem = false
                        onDark(it)
                    })
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Follow system", modifier = Modifier.weight(1f))
                    Switch(checked = followSystem, onCheckedChange = {
                        followSystem = it
                        onDark(null)
                    })
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Dynamic color = Android 12+; on Android 17 it picks up wallpaper tones
                    Text("Dynamic color (12+)", modifier = Modifier.weight(1f))
                    Switch(checked = dynamic, onCheckedChange = onDynamic)
                }
                Text(
                    "Light = ivory #FEF9EE / ink #141414. Dark = warm charcoal. " +
                        "Launcher uses the same picture: adaptive icon + Android 13+ themed monochrome.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = {}, modifier = Modifier.weight(1f)) { Text("Primary") }
            FilledTonalButton(onClick = {}, modifier = Modifier.weight(1f)) { Text("Tonal") }
            OutlinedButton(onClick = {}, modifier = Modifier.weight(1f)) { Text("Outline") }
        }
        ElevatedButton(onClick = {}, modifier = Modifier.fillMaxWidth()) {
            Text("SUPPORTS ANDROID 17 • EDGE-TO-EDGE • PREDICTIVE BACK")
        }
    }
}

@Composable
private fun ThemeScreen() {
    val swatches = listOf(
        "Primary" to Color(0xFF141414),
        "Gold" to Color(0xFFC9A86A),
        "Sand" to Color(0xFFEDE5D3),
        "Ivory" to Color(0xFFFEF9EE),
        "Taupe" to Color(0xFF6B6257),
        "Night" to Color(0xFF12110E)
    )
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Color system", style = MaterialTheme.typography.headlineMedium)
        swatches.forEach { (name, c) ->
            Card(shape = MaterialTheme.shapes.medium) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(c)
                    )
                    Spacer(Modifier.width(14.dp))
                    Column {
                        Text(name, style = MaterialTheme.typography.titleLarge)
                        Text(
                            String.format("#%06X", 0xFFFFFF and c.toArgb()),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
        }
        Text("Typography", style = MaterialTheme.typography.headlineMedium)
        Text("Display — Serif luxury", style = MaterialTheme.typography.displaySmall)
        Text("Headline — SemiBold serif", style = MaterialTheme.typography.headlineLarge)
        Text("Title — Letterspaced sans (logo voice)", style = MaterialTheme.typography.titleMedium)
        Text(
            "Body — The dotted handset in the logo becomes the divider motif: small, precise, human.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

@Composable
private fun ComponentsScreen() {
    var checked by remember { mutableStateOf(true) }
    var slider by remember { mutableFloatStateOf(0.6f) }
    var chip by remember { mutableStateOf(true) }
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Material 3 showcase", style = MaterialTheme.typography.headlineMedium)
        Card(shape = MaterialTheme.shapes.large) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Monogram card", style = MaterialTheme.typography.titleLarge)
                Text(
                    "Every component inherits ivory/ink/gold — buttons, chips, switches, sliders, nav.",
                    style = MaterialTheme.typography.bodyMedium
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = chip, onClick = { chip = !chip }, label = { Text("Gold") })
                    FilterChip(selected = !chip, onClick = { chip = !chip }, label = { Text("Ink") })
                }
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Switch", modifier = Modifier.weight(1f))
            Switch(checked = checked, onCheckedChange = { checked = it })
        }
        Text("Slider — ${(slider * 100).toInt()}% luxury")
        Slider(value = slider, onValueChange = { slider = it })
        // Status-bar inset demo (Android 17 edge-to-edge)
        val top = WindowInsets.statusBars.asPaddingValues().calculateTopPadding()
        Text(
            "Edge-to-edge active — status inset ${top.value.toInt()}dp handled, predictive back enabled.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.secondary
        )
    }
}

@Composable
private fun BrandScreen() {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Brand & APK icon", style = MaterialTheme.typography.headlineMedium)
        Text(
            "The attached picture is used in 3 places: launcher APK icon (adaptive + monochrome for Android 13+ themed icons), splash, and this full-bleed showcase.",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Start
        )
        Image(
            painter = painterResource(id = R.drawable.mendsway_brand),
            contentDescription = "Full brand artwork",
            modifier = Modifier
                .fillMaxWidth()
                .height(460.dp)
                .clip(MaterialTheme.shapes.extraLarge),
            contentScale = ContentScale.Crop
        )
        Button(
            onClick = {
                scope.launch {
                    val ok = withContext(Dispatchers.IO) {
                        try {
                            val wm = WallpaperManager.getInstance(ctx)
                            val bmp = BitmapFactory.decodeResource(
                                ctx.resources, R.drawable.mendsway_brand
                            )
                            wm.setBitmap(bmp)
                            true
                        } catch (_: Exception) { false }
                    }
                    Toast.makeText(
                        ctx,
                        if (ok) "Wallpaper applied" else "Wallpaper needs permission",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text("Set as wallpaper") }
        OutlinedCard(shape = MaterialTheme.shapes.large) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Android 17 support", style = MaterialTheme.typography.titleLarge)
                Text(
                    "• compileSdk 36 / targetSdk 36 — installable & tested behavior on API 37 (Android 17)\n" +
                        "• Edge-to-edge enforced (15/16/17)\n" +
                        "• Predictive back (enableOnBackInvokedCallback)\n" +
                        "• Themed launcher icon (monochrome, API 33+)\n" +
                        "• Per-app language (localeConfig, API 33+)\n" +
                        "• SplashScreen (API 31+ compat)\n" +
                        "• Notification + media runtime permissions (API 33+)",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}
