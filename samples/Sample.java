// Interlinked sample — Java
package interlinked.samples;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** A palette of named colours. */
public class Palette<T extends Comparable<T>> {
    private static final int MAX_SWATCHES = 64;
    private final List<String> names = new ArrayList<>();

    @Override
    public String toString() {
        return "Palette(" + names.size() + " swatches)";
    }

    public <R> Optional<R> find(String name, R fallback) {
        final boolean present = names.contains(name);
        if (!present) {
            return Optional.ofNullable(fallback);
        }
        return Optional.empty();
    }

    @Deprecated
    public void add(String name) {
        if (names.size() >= MAX_SWATCHES) {
            throw new IllegalStateException("palette is full: " + MAX_SWATCHES);
        }
        names.add(name);
    }
}
