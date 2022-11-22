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

    interface Set<T> {
        union(): Set<T>;
        intersection(): Set<T>;
        difference(): Set<T>;
    }
}

Array.prototype.front = function() { return this[0]; }
Array.prototype.back = function() { return this[this.length - 1]; }
String.prototype.mapReplace = function (objects: { [from: string]: string | number }) {
    let s = this.toString();
    for (let [from, to] of Object.entries(objects)) {
        s = s.replace(from, <string>to);
    }
    return s;
}


function formatItalianCurrency(n: number) {
    return '';
}
export function setCurrencyFormat(locale: string) {
    formatCurrency = formatItalianCurrency;
}
export var formatCurrency = (n: number) => { return ''; }
