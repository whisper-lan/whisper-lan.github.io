import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../lib/release.ts', import.meta.url), 'utf8');
const homePage = readFileSync(new URL('../app/components/HomePage.tsx', import.meta.url), 'utf8');

assert.match(page, /PLATFORM_FILE_SUFFIXES/);
assert.match(page, /macArm64:\s*\['macos-arm64\.dmg'\]/);
assert.match(page, /macX64:\s*\['macos-x86_64\.dmg'\]/);
assert.match(page, /if \(info\.macArm64\.url\) info\.mac = info\.macArm64/);
assert.match(page, /androidArm64:\s*\['android-arm64-v8a\.apk'\]/);
assert.match(page, /androidArmV7:\s*\['android-armeabi-v7a\.apk'\]/);
assert.match(page, /androidX64:\s*\['android-x86_64\.apk'\]/);
assert.match(page, /androidUniversal:\s*\['android-universal\.apk'\]/);
assert.match(page, /android:\s*\['android-universal\.apk', 'app-release\.apk'\]/);
assert.match(page, /linuxDeb:\s*\['linux-amd64\.deb'\]/);
assert.match(page, /linuxAppImage:\s*\['linux-x86_64\.appimage'\]/);
assert.match(page, /linuxRpm:\s*\['linux-x86_64\.rpm'\]/);
assert.match(page, /app-release\.apk/);
assert.match(page, /suffixes\s*\.map/);
assert.doesNotMatch(page, /android:\s*\['android-arm64-v8a\.apk/);

assert.match(homePage, /android:\s*buildOptions\(/);
assert.match(homePage, /linux:\s*buildOptions\(/);
assert.match(homePage, /!platformBuilds\[detected\.platform\]\?\.length/);
