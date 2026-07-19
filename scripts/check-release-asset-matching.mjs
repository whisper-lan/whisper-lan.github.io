import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../lib/release.ts', import.meta.url), 'utf8');

assert.match(page, /PLATFORM_FILE_SUFFIXES/);
assert.match(page, /android-arm64-v8a\.apk/);
assert.match(page, /android-universal\.apk/);
assert.match(page, /app-release\.apk/);
assert.match(page, /android:\s*\['android-arm64-v8a\.apk', 'android-universal\.apk', 'app-release\.apk'\]/);
assert.match(page, /suffixes\s*\.map/);
assert.doesNotMatch(page, /android:\s*'app-release\.apk'/);
