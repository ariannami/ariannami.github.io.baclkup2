/**
 * Pure radial wheel geometry & circular index math (inspired by carterogunsola.com/lab)
 */

export const DEFAULT_WHEEL_CONFIG = {
    radius: 675,
    angleStepDeg: 6.02667,
    scaleStep: 0.0117,
    minScale: 0.85,
    x0: 82.6318,
    y0: 414.5,
    fadeStartOffset: 4,
    fadeSlope: 0.263,
};

/**
 * Wraps an integer index into [0, count - 1]
 * @param {number} index
 * @param {number} count
 * @returns {number}
 */
export function wrapIndex(index, count) {
    if (!Number.isFinite(count) || count <= 0) return 0;
    const mod = Math.trunc(index) % count;
    const wrapped = mod < 0 ? mod + count : mod;
    return wrapped === 0 ? 0 : wrapped;
}

/**
 * Computes shortest signed angular/index delta on a circular list of length `count`
 * when clicking a slot or jumping to a target index.
 * @param {number} currentPos
 * @param {number} targetItemIndex
 * @param {number} count
 * @returns {number}
 */
export function getShortestCircularDelta(currentPos, targetItemIndex, count) {
    if (!Number.isFinite(count) || count <= 0) return 0;
    const currentWrapped = ((currentPos % count) + count) % count;
    let diff = wrapIndex(targetItemIndex, count) - currentWrapped;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
}

/**
 * Computes exact transform and visual state for a wheel slot at continuous offset `d`
 * from the horizontal center line (d = 0 is active center, d < 0 is above, d > 0 is below).
 * @param {number} d
 * @param {Partial<typeof DEFAULT_WHEEL_CONFIG>} [customConfig]
 */
export function computeWheelSlotMetrics(d, customConfig = {}) {
    const cfg = { ...DEFAULT_WHEEL_CONFIG, ...customConfig };
    const absD = Math.abs(d);
    const angleDeg = d * cfg.angleStepDeg;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = cfg.x0 + cfg.radius * (Math.cos(angleRad) - 1);
    const y = cfg.y0 + cfg.radius * Math.sin(angleRad);
    const scale = Math.max(cfg.minScale, 1 - absD * cfg.scaleStep);

    let opacity = 1;
    if (absD > cfg.fadeStartOffset) {
        opacity = Math.max(
            0,
            1 - (absD - cfg.fadeStartOffset) * cfg.fadeSlope
        );
    }

    const isActive = absD <= 0.5;
    const transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0px) rotate(${angleDeg.toFixed(4)}deg) scale(${scale.toFixed(4)})`;

    return {
        d,
        x,
        y,
        angleDeg,
        scale,
        opacity,
        isActive,
        transform,
    };
}

/**
 * Given a continuous wheel position `position`, item count `count`, and visible half-range `halfSlots`,
 * returns the ordered array of virtual slots from `-halfSlots` to `+halfSlots`.
 * @param {number} position
 * @param {number} count
 * @param {number} [halfSlots=7]
 * @param {Partial<typeof DEFAULT_WHEEL_CONFIG>} [customConfig]
 */
export function buildWheelVirtualSlots(
    position,
    count,
    halfSlots = 7,
    customConfig = {}
) {
    const safePos = Number.isFinite(position) ? position : 0;
    const baseIndex = Math.round(safePos);
    const frac = safePos - baseIndex;
    const slots = [];

    for (let k = -halfSlots; k <= halfSlots; k++) {
        const itemIndex = wrapIndex(baseIndex + k, count);
        const d = k - frac;
        const metrics = computeWheelSlotMetrics(d, customConfig);
        slots.push({
            slotOffset: k,
            itemIndex,
            ...metrics,
        });
    }

    return slots;
}

/**
 * Computes new continuous target position from a wheel deltaY, ensuring that
 * standard mouse-wheel ticks (|deltaY| >= 40) move far enough to cross the half-slot
 * snap threshold in the scrolled direction.
 * @param {number} currentTarget
 * @param {number} deltaY
 * @returns {number}
 */
export function computeWheelTargetFromDelta(currentTarget, deltaY) {
    if (!Number.isFinite(deltaY) || deltaY === 0) return currentTarget;
    const sign = deltaY > 0 ? 1 : -1;
    const mag = Math.abs(deltaY);
    // Standard mousewheel notch is ~100-120px; trackpad micro-deltas are 4-30px
    const stepMag =
        mag >= 50
            ? Math.max(0.65, Math.min(3.0, mag * 0.0085))
            : mag * 0.012;
    return currentTarget + sign * stepMag;
}

