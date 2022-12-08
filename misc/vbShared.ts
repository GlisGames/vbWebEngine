/* eslint-disable @typescript-eslint/no-loss-of-precision */
/** Any shared variables, objects, math defines etc. */
import { ColorOverlayFilter } from 'pixi-filters'


/** colors */
export const c = {
    Black:       0x000000,
    White:       0xFFFFFF,
    Gray:        0x808080,
    LightGray:   0xD3D3D3,
    DarkGray:    0x606060,
    Red:         0xFF0000,
    DarkRed:     0x8B0000,
    Pink:        0xFFC0CB,
    DeepPink:    0xFF1493,
    Orange:      0xFFA500,
    Gold:        0xFFD700,
    Yellow:      0xFFFF00,
    Green:       0x00FF00,
    DarkGreen:   0x006400,
    SpringGreen: 0x00FF7F,
    Aqua:        0x7FFFD4,
    Blue:        0x0000FF,
    DarkBlue:    0x00008B,
    SkyBlue:     0x00BFFF,
    LightBlue:   0x87CEFA,
    Purple:      0x800080,
    Magneta:     0xFF00FF
}

/** math defines */
export const m = {
    e:           2.71828182845904523536,
    /** log2(e) */
    log2e:       1.44269504088896340736,
    /** log10(e) */
    log10e:      0.434294481903251827651,
    ln2:         0.693147180559945309417,
    ln10:        2.30258509299404568402,

    pi:          3.14159265358979323846,
    /** 2*pi */
    pi2:         6.28318530717958647692,
    /** pi/2 */
    pi1_2:       1.57079632679489661923,
    /** pi/4 */
    pi1_4:       0.785398163397448309616,
    /** 1/pi */
    _1_pi:    0.318309886183790671538,
    /** 2/pi */
    _2_pi:    0.636619772367581343076,

    /** sqrt(2) */
    sqrt2:       1.41421356237309504880,
    /** 1/sqrt(2) */
    _1_sqrt2: 0.707106781186547524401,
}


class SharedObjects {
    colorFilter = {} as ColorOverlayFilter;

    init() {
        this.colorFilter = new ColorOverlayFilter();
    }
}


export var shared = new SharedObjects();
