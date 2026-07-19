import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../lib/release.ts', import.meta.url), 'utf8');

assert.match(page, /PLATFORM_FILE_SUFFIXES/);
assert.match(page, /android-universal\.apk/);
assert.match(page, /app-release\.apk/);
assert.match(page, /\.some\(\(suffix\) => name\.endsWith\(suffix\)\)/);
assert.doesNotMatch(page, /android:\s*'app-release\.apk'/);
