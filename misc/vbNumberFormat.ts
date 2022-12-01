export function setNumberFormat(locale: string) {
    fmtNumber = fmtItalianNumber;
    fmtNumber0 = fmtItalianNumber0;
    fmtCurrency = fmtItalianCurrency;
    fmtCurrency0 = fmtItalianCurrency0;
}
/** Formatted number with (forced) decimals */
export var fmtNumber = (value: number, forced=true) => { return ''; }
/** Formatted number with no decimals */
export var fmtNumber0 = (value: number) => { return ''; }
/** Formatted number currency with (forced) decimals */
export var fmtCurrency = (value: number, forced=true) => { return ''; }
/** Formatted number currency with no decimals */
export var fmtCurrency0 = (value: number) => { return ''; }


function fmtItalianNumber0(value: number) {
    value = Math.floor(value / 100);
    if (value < 1000)
        return `${value}`;
    else {
        let units = value % 1000;
        value = Math.floor(value / 1000);
        if (value < 1000)
            return `${value}.${units.pad0(3)}`;
        else {
            let thousands = value % 1000;
            return `${value}.${thousands.pad0(3)}.${units.pad0(3)}`;
        }
    }
}
function fmtItalianNumber(value: number, forced=true) {
    let decimal = value % 100;
    let s = fmtItalianNumber0(value);
    if (forced || decimal > 0)
        return `${s},${decimal.pad0(2)}`;
    else return s;
}
function fmtItalianCurrency0(value: number) {
    let s = fmtItalianNumber0(value);
    return `€${s}`;
}
function fmtItalianCurrency(value: number, forced=true) {
    let decimal = value % 100;
    let s = fmtItalianNumber0(value);
    if (forced || decimal > 0)
        return `€${s},${decimal.pad0(2)}`;
    else return `€${s}`;
}
