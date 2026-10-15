// Interlinked sample — Kotlin
package interlinked.samples

import kotlin.math.roundToInt

@Target(AnnotationTarget.CLASS)
annotation class Documented

/** A named colour with an alpha channel. */
@Documented
data class Swatch(val name: String, val hex: String, val alpha: Double = 1.0)

fun Swatch.withAlpha(value: Double): Swatch = copy(alpha = value)

fun Swatch.alphaByte(): Int = (alpha * 255).roundToInt()

class Palette(private val swatches: MutableMap<String, Swatch> = mutableMapOf()) {
    var lastError: String? = null
        private set

    fun add(swatch: Swatch) {
        swatches[swatch.name] = swatch
    }

    fun describe(name: String): String {
        val swatch = swatches[name]
        return when {
            swatch == null -> "unknown colour: $name".also { lastError = it }
            swatch.alpha < 0.5 -> "${swatch.name} is faint (${swatch.alphaByte()})"
            else -> "${swatch.name} = ${swatch.hex}"
        }
    }
}

fun main() {
    val palette = Palette()
    palette.add(Swatch("teal", "#00CC99"))
    println(palette.describe("teal"))
}
