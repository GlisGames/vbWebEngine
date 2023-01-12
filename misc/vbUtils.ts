/* eslint-disable @typescript-eslint/no-explicit-any */
/** Any utility functions, extensions etc */
import type { Pnt2, StructuralPoints } from '@vb/core/vbTransform';
import { m } from './vbShared';


declare global {
    interface Array<T> {
        clear(): void;
        front(): T;
        back(): T;
        moveToBack(fromIndex: number): void;
        swap(index1: number, index2: number): void;
        /** Remove the matched item once at a time */
        removeOnce(item: T): void;
        union(other: T[]): T[];
        intersection(other: T[]): T[];
        difference(other: T[]): T[];
    }

    interface ArrayConstructor {
        /** compare elements of two arrays one by one sequentially */
        isEqual(arr1: any[], arr2: any[]): boolean;
        /** Generate a list of numbers */
        rangeFrom(start: number, stop?: number, step?: number): number[];
        /** Return an iterator */
        range(start: number, stop?: number, step?: number): Generator<number, void>;
    }

    interface String {
        /**
         * Map multiple strings
         * (simply use replace multiple times...)
         */
        mapReplace(objects: { [from: string]: string | number }): string;
    }

    interface Number {
        /** Format number with padding character */
        pad(len: number, char: string): string;
        pad0(len: number): string;
    }

    interface ObjectConstructor {
        /** Remove all properties whose values are undefined, use at your own risk */
        removeUndef(obj: any): void;
    }

    interface Set<T> {
        union(other: Set<T>): Set<T>;
        intersection(other: Set<T>): Set<T>;
        difference(other: Set<T>): Set<T>;
    }

    interface Math {
        randInt(max: number): number;
        /**
         * @param [probs] Array of probabilities that has the sum of 1
         * @return index of the picked probability
         */
        randPickFromProbs(probs: number[]): number;
        /**
         * @param [n] How many times to perform random element swap, default is the length of array.
         */
        shuffle(arr: any[], n?: number): void;
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
Array.prototype.moveToBack = function(fromIndex: number) {
    let tmp = this[fromIndex];
    this.splice(fromIndex, 1);
    this.push(tmp);
}
Array.prototype.swap = function(index1: number, index2: number) {
    let tmp = this[index1];
    this[index1] = this[index2];
    this[index2] = tmp;
}
Array.prototype.removeOnce = function(item: any) {
    let index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
}
Array.prototype.union = function(other: any[]) {
    return [...new Set([...this, ...other])];
}
Array.prototype.intersection = function(other: any[]) {
    return Array.from(this).filter(x => other.includes(x));
}
Array.prototype.difference = function(other: any[]) {
    return Array.from(this).filter(x => !other.includes(x));
}

Array.isEqual = function(arr1: any[], arr2: any[]) {
    if (arr1.length != arr2.length) return false;
    for (let i of Array.range(arr1.length)) {
        if (arr1[i] != arr2[i]) return false;
    }
    return true;
}
Array.rangeFrom = function(start: number, stop?: number, step?: number) {
    if (step === undefined) step = 1;
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    return Array.from({ length: (stop - start) / step }, (_, i) => start + (i * <any>step));
}
Array.range = function(start: number, stop?: number, step?: number) {
    if (step === undefined) step = 1;
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    const gen = function* () {
        for (let i = start; i < (<number>stop); i += (<number>step)) {
            yield i;
        }
    }
    return gen();
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

Object.removeUndef = function(obj: any) {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
}

Set.prototype.union = function(other: Set<any>) {
    return new Set([...this, ...other]);
}
Set.prototype.intersection = function(other: Set<any>) {
    return new Set(
        Array.from(this).filter(x => other.has(x))
    );
}
Set.prototype.difference = function(other: Set<any>) {
    return new Set(
        Array.from(this).filter(x => !other.has(x))
    );
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
Math.shuffle = function(arr: any[], n?: number) {
    if (n === undefined) n = arr.length;
    for (let i = 0; i < n; i++) {
        arr.swap(i, Math.randInt(arr.length));
    }
}


export function arrToObj<T>(arr: T[]) {
    const obj: Record<number, T> = {};
    for (let i of Array.range(arr.length)) {
        obj[i] = arr[i];
    }
    return obj;
}

export function unbindPoint(target: Pnt2, source: [number, number]) {
    target.x = source[0], target.y = source[1];
}
export function unpackPoint(source: [number, number]): Pnt2 {
    return { x:source[0], y:source[1] };
}
export function assignPoint(target: Pnt2, source: Pnt2) {
    target.x = source.x, target.y = source.y;
}

export function assignPointBatch(target: StructuralPoints, source: StructuralPoints) {
    for (const key in target) {
        const targetObj = target[key];
        const sourceObj = source[key];
        if (sourceObj === undefined) continue;
        if (targetObj.x === undefined || targetObj.y === undefined)
            assignPointBatch(<StructuralPoints>targetObj, <StructuralPoints>sourceObj);
        else
            assignPoint(<Pnt2>targetObj, <Pnt2>sourceObj);
    }
}

export function distance2(a: Pnt2, b: Pnt2) {
    let dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

export function distance(a: Pnt2, b: Pnt2) {
    let dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * fit the range [0, interval)
 * @param [interval] default is 2pi
 */
export function roundRadian(r: number, interval=m.pi2) {
    r = r % interval;
    if (r < 0) r += interval;
    return r;
}