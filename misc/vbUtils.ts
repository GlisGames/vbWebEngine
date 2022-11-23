/** Any utility functions, extensions etc */
declare global {
    interface Array<T> {
        front(): T;
        back(): T;
    }

    interface String {
        /**
         * Map multiple strings (simply use replace multiple times...)
         */
        mapReplace(objects: { [from: string]: string | number }): string;
    }

    interface Number {
        /**
         * Format number with padding character
         */
        pad(len: number, char: string): string;
        pad0(len: number): string;
    }

    interface Set<T> {
        union(): Set<T>;
        intersection(): Set<T>;
        difference(): Set<T>;
    }
}

Array.prototype.front = function() { return this[0]; }
Array.prototype.back = function() { return this[this.length - 1]; }

String.prototype.mapReplace = function(objects: { [from: string]: string | number }) {
    let s = this.toString();
    for (let [from, to] of Object.entries(objects)) {
        s = s.replace(from, <string>to);
    }
    return s;
}

Number.prototype.pad = function(len: number, char: string) {
    return String(this).padStart(len, char);
}
Number.prototype.pad0 = function(len: number) {
    return String(this).padStart(len, '0');
}


function formatItalianCurrency(value: number) {
    let decimal = value % 100;
    value = Math.floor(value / 100);
    if (value < 1000)
        return `€${value},${decimal.pad0(2)}`;
    else {
        let units = value % 1000;
        value = Math.floor(value / 1000);
        if (value < 1000)
            return `€${value}.${units.pad0(3)},${decimal.pad0(2)}`;
        else {
            let thousands = value % 1000;
            return `€${value}.${thousands.pad0(3)}.${units.pad0(3)},${decimal.pad0(2)}`;
        }
    }
}
export function setCurrencyFormat(locale: string) {
    formatCurrency = formatItalianCurrency;
}
export var formatCurrency = (value: number) => { return ''; }
