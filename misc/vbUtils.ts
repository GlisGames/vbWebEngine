/** Any utility functions, extensions etc */
declare global {
    interface Array<T> {
        clear(): void;
        front(): T;
        back(): T;
        /**
         * Remove the matched item once at a time
         */
        removeOnce(item: T): void;
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

    interface Math {
        randInt(max: number): number;
        /**
         * @param [probs] array of probabilities that has the sum of 1
         * @return index of the picked probability
         */
        randPickFromProbs(probs: number[]): number;
    }
}


Array.prototype.clear = function() {
    this.length = 0;
}
Array.prototype.front = function() {
    return this[0];
}
Array.prototype.back = function() {
    return this[this.length - 1];
}
Array.prototype.removeOnce = function(item: any) {
    let index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
}

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

Math.randInt = function(max: number) {
    return Math.floor(Math.random() * max);
}
Math.randPickFromProbs = function(probs: number[]) {
    // with index
    let arr: [number, number][] = [];
    for (let i = 0; i < probs.length; i++) {
        arr.push([probs[i], i]);
    }
    arr.sort((a: [number, number], b: [number, number]) => {
        return a[0] - b[0];
    });
    // pre sum
    for (let i = 1; i < probs.length; i++) {
        arr[i][0] += arr[i-1][0];
    }
    // get a random and determine where it belongs
    let r = Math.random();
    for (let [prob, index] of arr) {
        if (r <= prob) return index;
    }
    return -1;
}


export function setCurrencyFormat(locale: string) {
    formatCurrency = formatItalianCurrency;
}
export var formatCurrency = (value: number) => { return ''; }


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
