/** Any utility functions, extensions etc */


declare global {
    interface Array<T> {
        front(): T;
        back(): T;
    }
}

Array.prototype.front = function() { return this[0]; }
Array.prototype.back = function() { return this[this.length - 1]; }


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
