'use client';
import Lenis from 'lenis';
import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './primitives';

// Page scrolling for the scroll-driven story. See DESIGN.md, "Motion".
//
// Lenis turns stepped wheel and trackpad input into one continuous glide, so
// everything tied to the scroll position moves frame by frame with it.
//
// Sections can also tell the page where it may come to rest:
//
// - Shots (useSnapShots, useSnapGap): a stretch of scroll between two finished
//   states, such as the opening fly-through. Let go inside one and the page
//   carries on to the finished state in the direction it was moving; a nudge
//   that barely entered falls back, and a gesture that came in from outside
//   stops at the end it came in by.
// - Pages (useSnapPages): resting points a reader should land on, such as each
//   feature chapter centred. A gesture moves at most one page: what the reader
//   drags is followed as it is, but momentum never carries past the next page.
//   A small nudge returns to the page it started from.
//
// Either way the page continues from the speed it already has and eases to a
// stop (a cubic Hermite curve), so there is no halt-and-restart and no jolt.

type Decision = { y: number; rest: number; dir: number; origin: number | null };
// `owns` says whether the page is currently inside the zone; `decide` says where to rest.
type Zone = { owns: (y: number) => boolean; decide: (d: Decision) => { target: number; kind: 'shot' | 'page' } | null };
const zones = new Set<Zone>();

const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));
const DEAD_ZONE = 0.05; // shots: nudges smaller than this fall back
const PAGE_NUDGE = 0.1; // pages: gestures shorter than this return to where they began
const PAGE_CAPTURE = 0.25; // pages: how far short of the first/last page a gesture may end and still land on it
const WHEEL_GAP = 70; // ms without trackpad input that counts as letting go
const NOTCH_GAP = 120; // the same for a notched mouse wheel, whose clicks arrive further apart
const SETTLE_DELAY = 140; // ms of stillness for anything else (touch, keys, scrollbar)
const MAX_SLOPE = 2.4; // Hermite start slope beyond which the curve would overshoot

type Span = readonly [number, number];

function shotZone(bounds: () => Span[]): Zone {
  return {
    owns: (y) => bounds().some(([a, b]) => y > a + 1 && y < b - 1),
    decide: ({ rest, dir, origin }) => {
      for (const [a, b] of bounds()) {
        if (rest <= a + 1 || rest >= b - 1) continue;
        // came in from outside: stop at the end it came in by, one stop per gesture
        if (origin !== null && dir < 0 && origin > b + 1) return { target: b, kind: 'shot' };
        if (origin !== null && dir > 0 && origin < a - 1) return { target: a, kind: 'shot' };
        const f = (rest - a) / (b - a);
        return { target: dir > 0 ? (f < DEAD_ZONE ? a : b) : f > 1 - DEAD_ZONE ? b : a, kind: 'shot' };
      }
      return null;
    },
  };
}

function useZone(make: () => Zone, deps: unknown[], enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const zone = make();
    zones.add(zone);
    return () => {
      zones.delete(zone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);
}

// `intervals` are fractions of the pinned element's scroll range
// (0 = its top reaches the top of the view, 1 = its bottom reaches the bottom).
export function useSnapShots(ref: RefObject<HTMLElement | null>, intervals: [number, number][], enabled = true) {
  const key = intervals.map(([a, b]) => `${a}:${b}`).join(',');
  useZone(
    () => {
      const fractions = key.split(',').map((pair) => pair.split(':').map(Number) as [number, number]);
      return shotZone(() => {
        const el = ref.current;
        if (!el) return [];
        const top = el.getBoundingClientRect().top + window.scrollY;
        const range = el.offsetHeight - window.innerHeight;
        return fractions.map(([fa, fb]) => [Math.round(top + fa * range), Math.round(top + fb * range)] as const);
      });
    },
    [ref, key],
    enabled,
  );
}

// A shot between two resting points in different sections, in page pixels,
// such as the stretch from the manifesto to the next section's title.
export function useSnapGap(span: () => Span | null, enabled = true) {
  useZone(
    () =>
      shotZone(() => {
        const s = span();
        return s && s[1] - s[0] > 4 ? [s] : [];
      }),
    [span],
    enabled,
  );
}

// `points` returns the resting scroll positions in page pixels, in order.
// It is called on every decision, so it should read cached measurements.
export function useSnapPages(points: () => number[], enabled = true) {
  useZone(() => {
    const owns = (y: number) => {
      const p = points();
      return p.length > 1 && y >= p[0] - 1 && y <= p[p.length - 1] + 1;
    };
    const decide: Zone['decide'] = ({ y, rest, dir, origin }) => {
      const p = points();
      const n = p.length;
      if (n < 2) return null;
      const first = p[0];
      const last = p[n - 1];
      const spacing = (last - first) / (n - 1);
      const nearest = (v: number) => p.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best), first);
      if (origin === null) {
        // no gesture to follow (a programmatic scroll, say): settle on the nearest page if close
        if (y < first - spacing * PAGE_CAPTURE || y > last + spacing * PAGE_CAPTURE) return null;
        const target = nearest(y);
        return Math.abs(target - y) < 3 ? null : { target, kind: 'page' };
      }
      // a small nudge from a page goes back to it
      if (origin !== null && origin > first - spacing * PAGE_NUDGE && origin < last + spacing * PAGE_NUDGE && Math.abs(rest - origin) < spacing * PAGE_NUDGE) {
        return { target: nearest(origin), kind: 'page' };
      }
      // outside: only catch a gesture that is heading in and would end near the edge
      if (y < first - 1) return dir > 0 && rest > first - spacing * PAGE_CAPTURE ? { target: first, kind: 'page' } : null;
      if (y > last + 1) return dir < 0 && rest < last + spacing * PAGE_CAPTURE ? { target: last, kind: 'page' } : null;
      // inside: the next page in the direction of travel, never further
      const ahead = dir > 0 ? p.find((x) => x > y + 1) : [...p].reverse().find((x) => x < y - 1);
      return ahead === undefined ? null : { target: ahead, kind: 'page' };
    };
    return { owns, decide };
  }, [points], enabled);
}

// The zone the page is in decides first, so a gesture that starts among the
// pages moves one page even if its momentum would carry it into a shot.
function decide(d: Decision) {
  const all = [...zones];
  for (const zone of [...all.filter((z) => z.owns(d.y)), ...all.filter((z) => !z.owns(d.y))]) {
    const result = zone.decide(d);
    if (result) return result;
  }
  return null;
}

export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    let settling = false;
    let direction = 1;
    let speed = 0; // px/s, signed, measured from the scroll itself
    let lastY = window.scrollY;
    let lastT = performance.now();
    let origin: number | null = null; // where the current gesture began
    let wheelTimer: number | undefined;
    let idleTimer: number | undefined;
    let lastWheelAt = 0;
    let lastWheelAbs = 0;
    let decaying = 0; // consecutive shrinking wheel deltas: trackpad momentum
    let decided = false; // the current gesture has already been settled
    let absorbing = false; // swallowing the rest of a settled gesture's momentum
    let absorbSign = 0;

    const begin = () => {
      if (origin !== null) return;
      origin = lenis.animatedScroll;
      decided = false;
    };

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -56, duration: 1.4, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
      stopInertiaOnNavigate: true,
      virtualScroll: ({ deltaY, event }) => {
        const now = performance.now();
        if (event.type.includes('touch')) {
          if (event.type === 'touchstart') {
            release();
            origin = null;
            begin();
          }
          return true;
        }
        const abs = Math.abs(deltaY);
        const gap = now - lastWheelAt;
        lastWheelAt = now;
        const previousAbs = lastWheelAbs;
        lastWheelAbs = abs;
        const notch = abs >= 50 && gap > 25; // a mouse wheel click rather than trackpad flow
        if (settling || absorbing) {
          // Once a gesture has been settled, the rest of its momentum is
          // swallowed — during the settle and after it — so it cannot carry the
          // page on. A fresh gesture (after a pause, the other way, a stronger
          // push or another wheel click) takes over at once.
          const fresh = gap > 130 || Math.sign(deltaY) !== absorbSign || abs > previousAbs * 1.6 + 2 || (abs >= 50 && abs >= previousAbs);
          if (!fresh) {
            if (event.cancelable) event.preventDefault();
            return false;
          }
          release();
          absorbing = false;
          origin = null;
        }
        begin();
        decaying = gap < 110 && abs > 0 && abs < previousAbs ? decaying + 1 : 0;
        if (decaying >= 2) {
          // The fingers are off and the rest is momentum: project where it
          // would end and settle from here if that matters to a section.
          const dir = Math.sign(deltaY);
          if (settle(lenis.targetScroll + dir * abs * 10, dir, true)) return true;
        }
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(
          () => {
            if (!settling) settle(lenis.targetScroll, direction, true);
            origin = null;
          },
          notch ? NOTCH_GAP : WHEEL_GAP,
        );
        return true;
      },
    });

    // Lenis keeps the unlock private; it is exactly what ends a settle early.
    const unlock = () => (lenis as unknown as { reset: () => void }).reset();

    function release() {
      if (!settling) return;
      settling = false;
      unlock();
    }

    // Continue from the current position and speed to wherever the sections
    // want the page to rest, easing out to a stop.
    function settle(rest: number, dir: number, fromWheel = false): boolean {
      decided = true;
      const from = lenis.animatedScroll;
      const result = decide({ y: from, rest, dir, origin });
      origin = null;
      if (!result) return false;
      const distance = result.target - from;
      if (Math.abs(distance) < 2) return false;
      // shots take their time (about 2.5 s for the whole opening); pages are brisk
      let duration = result.kind === 'shot' ? clamp(0.5, 0.45 + Math.abs(distance) / 950, 2.6) : clamp(0.5, 0.35 + Math.abs(distance) / 1800, 1.1);
      // keep the starting speed: shorten the curve rather than cap its slope
      if ((speed * duration) / distance > MAX_SLOPE) duration = Math.max(0.35, (MAX_SLOPE * distance) / speed);
      const slope = clamp(0, (speed * duration) / distance, MAX_SLOPE);
      settling = true;
      if (fromWheel) {
        absorbing = true;
        absorbSign = dir;
      }
      direction = Math.sign(distance);
      lenis.scrollTo(result.target, {
        duration,
        easing: (t) => slope * (t * t * t - 2 * t * t + t) + (3 * t * t - 2 * t * t * t),
        lock: true,
        force: true,
        onComplete: () => {
          settling = false;
        },
      });
      return true;
    }

    const unsubscribe = lenis.on('scroll', () => {
      const now = performance.now();
      const y = lenis.animatedScroll;
      const dt = now - lastT;
      if (dt > 0) speed = speed * 0.5 + ((y - lastY) / dt) * 1000 * 0.5;
      if (!settling && y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;
      lastT = now;
      // Touch, keys and the scrollbar have no wheel to watch: wait for stillness.
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        speed = 0;
        if (!settling && !decided) settle(window.scrollY, direction);
      }, SETTLE_DELAY);
    });

    const onInput = () => {
      release();
      origin = null;
      begin();
    };
    window.addEventListener('keydown', onInput);
    window.addEventListener('pointerdown', onInput);

    return () => {
      unsubscribe();
      window.clearTimeout(wheelTimer);
      window.clearTimeout(idleTimer);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('pointerdown', onInput);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
