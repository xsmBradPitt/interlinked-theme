// Interlinked sample — C#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Interlinked.Samples;

/// <summary>A named colour with an optional alpha channel.</summary>
public record Swatch(string Name, string Hex, double Alpha = 1.0);

[Serializable]
public class PaletteService
{
    private readonly Dictionary<string, Swatch> _swatches = new();

    public int Count => _swatches.Count;

    public string? LastError { get; private set; }

    public PaletteService(IEnumerable<Swatch> initial)
    {
        foreach (var s in initial) _swatches[s.Name] = s;
    }

    public async Task<Swatch?> FindAsync(string name, int retries = 3)
    {
        await Task.Delay(10);
        if (_swatches.TryGetValue(name, out var swatch)) return swatch;
        LastError = $"missing swatch '{name}' after {retries} tries";
        return null;
    }

    public IEnumerable<string> Bright(double threshold) =>
        _swatches.Values
            .Where(s => s.Alpha >= threshold && !string.IsNullOrEmpty(s.Hex))
            .OrderBy(s => s.Name)
            .Select(s => s.Hex);
}
