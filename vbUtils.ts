/** Any utility functions, extensions, math defines, presets, etc. */
import * as PIXI from 'pixi.js';


declare global {
    interface Array<T> {
        front(): T;
        back(): T;
    }
}

Array.prototype.front = function() { return this[0]; }
Array.prototype.back = function() { return this[this.length - 1]; }


export namespace vb {
    var _currency = '€';
    var _precision = 2;
    export function setCurrencySymbol(s: string) {
        _currency = s;
    }
    export function setCurrencyPrecision(n: number) {
        _precision = n;
    }
    export function formatCurrency(n: number) {
        return _currency + n.toFixed(_precision);
    }

    export const Black = 0x000000;
    export const White = 0xFFFFFF;
    export const Gray = 0x808080;
    export const LightGray = 0xD3D3D3;
    export const DarkGray = 0x606060;
    export const Red = 0xFF0000;
    export const DarkRed = 0x8B0000;
    export const Pink = 0xFFC0CB;
    export const DeepPink = 0xFF1493;
    export const Orange = 0xFFA500;
    export const Gold = 0xFFD700;
    export const Yellow = 0xFFFF00;
    export const Green = 	0x00FF00
    export const DarkGreen = 0x006400;
    export const SpringGreen = 0x00FF7F;
    export const Aqua = 0x7FFFD4;
    export const Blue = 0x0000FF;
    export const DarkBlue = 0x00008B;
    export const SkyBlue = 0x00BFFF;
    export const LightBlue = 0x87CEFA;
    export const Purple = 0x800080;
    export const Magneta = 0xFF00FF;    
}
