// Interlinked sample — TypeScript
import { readFile } from 'node:fs/promises';

/** A theme palette: every colour has a name. */
export interface Palette {
  readonly [name: string]: string;
}

export enum Severity { Error = 1, Warning, Info }

const MAX_RETRIES = 3;
const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

@sealed
export class ThemeLoader<T extends Palette = Palette> {
  private cache = new Map<string, T>();

  constructor(private readonly root: string, public verbose = false) {}

  async load(name: string, attempt = 0): Promise<T | null> {
    const path = `${this.root}/${name}.json`;
    try {
      const raw = await readFile(path, 'utf8');
      const palette = JSON.parse(raw) as T;
      this.cache.set(name, palette);
      if (this.verbose) console.log(`loaded ${name}\t(${raw.length} bytes)`);
      return palette;
    } catch (err) {
      if (attempt < MAX_RETRIES) return this.load(name, attempt + 1);
      return null;
    }
  }
}

export const isHex = (value: string): boolean => HEX.test(value) && value !== 'none';

const wrong: number = 'intentional type error';   // 看紅色波浪線
