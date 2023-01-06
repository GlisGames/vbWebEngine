import Easing from './Easing'
import Interpolation from './Interpolation'
import type vbTweenGroup from './vbTweenGroup'
import type { EasingFunction } from './Easing'
import type { InterpolationFunction } from './Interpolation'


// eslint-disable-next-line
type UnknownProps = Record<string, any>

class vbTween<T extends UnknownProps> {
    protected _name: string
    protected _object: T
    protected _group: vbTweenGroup | false
    protected _valuesStart: UnknownProps = {}
    protected _valuesEnd: Record<string, number | string> = {}
    protected _valuesStartRepeat: UnknownProps = {}

    protected _startTime = 0
    protected _delayTime = 0
    protected _duration = 1000
    protected _repeat = 0
    protected _repeatDelayTime?: number
    protected _initialRepeat = 0
    protected _isPlaying = false
    protected _isPaused = false
    protected _pauseStart = 0
    protected _yoyo = false
    protected _reversed = false
    protected _goToEnd = false

    protected _easingFunction: EasingFunction = Easing.Linear.None
    protected _interpolationFunction: InterpolationFunction = Interpolation.Linear
    // eslint-disable-next-line
    protected _chainedTweens: Array<vbTween<any>> = []
    protected _isChainStopped = false

    protected _onStartCallback?: (object: T) => void
    protected _onStartCallbackFired = false
    protected _onEveryStartCallback?: (object: T) => void
    protected _onEveryStartCallbackFired = false
    protected _onUpdateCallback?: (object: T, elapsed: number) => void
    protected _onRepeatCallback?: (object: T) => void
    protected _onEndCallbacks: ((object: T) => void)[] = [];
    protected _onStopCallback?: (object: T) => void

    constructor(name: string, obj: T, group: vbTweenGroup | false) {
        this._name = name
        this._object = obj
        this._group = group
    }

    get name() {
        return this._name;
    }
    isPlaying(): boolean {
        return this._isPlaying
    }
    isPaused(): boolean {
        return this._isPaused
    }
    isEnded(): boolean {
        return this._goToEnd
    }

    to(properties: UnknownProps, duration=1000): this {
        // TODO? restore this, then update the 07_dynamic_to example to set fox
        // tween's to on each update. That way the behavior is opt-in (there's
        // currently no opt-out).
        // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
        this._valuesEnd = Object.create(properties)
        this._duration = duration
        return this
    }

    /**
     * @param [force] Whether to restart if it's already playing
     */
    start(force=false, time=performance.now()): this {
        if (this._isPlaying && !force) {
            return this
        }

        // eslint-disable-next-line
        this._group && this._group.add(this as any)

        this._repeat = this._initialRepeat

        if (this._reversed) {
            // If we were reversed (f.e. using the yoyo feature) then we need to
            // flip the tween direction back to forward.

            this._reversed = false

            for (const property in this._valuesStartRepeat) {
                this._swapEndStartRepeatValues(property)
                this._valuesStart[property] = this._valuesStartRepeat[property]
            }
        }

        this._isPlaying = true
        this._isPaused = false

        this._onStartCallbackFired = false
        this._onEveryStartCallbackFired = false

        this._isChainStopped = false

        this._startTime = time
        this._startTime += this._delayTime

        this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat)
        return this
    }

    stop(): this {
        if (!this._isChainStopped) {
            this._isChainStopped = true
            this.stopChainedTweens()
        }
        if (!this._isPlaying) {
            return this
        }

        // eslint-disable-next-line
        this._group && this._group.remove(this as any)

        this._isPlaying = false
        this._isPaused = false

        if (this._onStopCallback) {
            this._onStopCallback(this._object)
        }
        return this
    }

    /**
     * Unlike `stop()` which simply stop the current tweening,
     * `end()` make sure to update values to the end.
     */
    end(): this {
        this._goToEnd = true
        this.update(Infinity)
        return this
    }

    pause(time=performance.now()): this {
        if (this._isPaused || !this._isPlaying) {
            return this
        }
        this._isPaused = true
        this._pauseStart = time

        // eslint-disable-next-line
        this._group && this._group.remove(this as any)
        return this
    }

    resume(time=performance.now()): this {
        if (!this._isPaused || !this._isPlaying) {
            return this
        }
        this._isPaused = false
        this._startTime += time - this._pauseStart
        this._pauseStart = 0

        // eslint-disable-next-line
        this._group && this._group.add(this as any)
        return this
    }

    group(group: vbTweenGroup | false): this {
        this._group = group
        return this
    }
    duration(d: number): this {
        this._duration = d
        return this
    }
    delay(amount: number): this {
        this._delayTime = amount
        return this
    }
    repeat(times: number): this {
        this._initialRepeat = times
        this._repeat = times
        return this
    }
    repeatDelay(amount: number): this {
        this._repeatDelayTime = amount
        return this
    }
    yoyo(yoyo: boolean): this {
        this._yoyo = yoyo
        return this
    }
    easing(easingFunction: EasingFunction): this {
        this._easingFunction = easingFunction
        return this
    }
    interpolation(interpolationFunction: InterpolationFunction): this {
        this._interpolationFunction = interpolationFunction
        return this
    }

    /**
     * A frequent usage scenario is that multiple entities want to add each of their onEnd callback
     * to a single tween. So this method enables support for multiple callbacks.
     */
    addOnEnd(callback: (object: T) => void) {
        this._onEndCallbacks.push(callback)
        return this
    }
    /**
     * Clear onEnd callbacks
     */
    clearOnEnd() {
        this._onEndCallbacks.clear()
        return this
    }
    /**
     * This method will only keep one callback at a time
     */
    onEnd(callback?: (object: T) => void): this {
        if (callback !== undefined)
            return this.clearOnEnd().addOnEnd(callback)
        else
            return this.clearOnEnd()
    }
    onStart(callback?: (object: T) => void): this {
        this._onStartCallback = callback
        return this
    }
    onEveryStart(callback?: (object: T) => void): this {
        this._onEveryStartCallback = callback
        return this
    }
    onUpdate(callback?: (object: T, elapsed: number) => void): this {
        this._onUpdateCallback = callback
        return this
    }
    onRepeat(callback?: (object: T) => void): this {
        this._onRepeatCallback = callback
        return this
    }
    onStop(callback?: (object: T) => void): this {
        this._onStopCallback = callback
        return this
    }

    // eslint-disable-next-line
    chain(...tweens: Array<vbTween<any>>): this {
        this._chainedTweens = tweens
        return this
    }
    stopChainedTweens(): this {
        for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
            this._chainedTweens[i].stop()
        }
        return this
    }

    /**
     * @returns true if the tween is still playing after the update, false
     * otherwise (calling update on a paused tween still returns true because
     * it is still playing, just paused).
     */
    update(time: number): boolean {
        if (this._isPaused) return true

        let property
        let elapsed

        const endTime = this._startTime + this._duration

        if (!this._goToEnd && !this._isPlaying) {
            if (time > endTime) return false
        }
        if (time < this._startTime) {
            return true
        }

        if (this._onStartCallbackFired === false) {
            if (this._onStartCallback) {
                this._onStartCallback(this._object)
            }
            this._onStartCallbackFired = true
        }

        if (this._onEveryStartCallbackFired === false) {
            if (this._onEveryStartCallback) {
                this._onEveryStartCallback(this._object)
            }
            this._onEveryStartCallbackFired = true
        }

        elapsed = (time - this._startTime) / this._duration
        elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed

        const value = this._easingFunction(elapsed)

        // properties transformations
        this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value)

        if (this._onUpdateCallback) {
            this._onUpdateCallback(this._object, elapsed)
        }

        if (elapsed === 1) {
            if (this._repeat > 0) {
                if (isFinite(this._repeat)) {
                    this._repeat--
                }

                // Reassign starting values, restart by making startTime = now
                for (property in this._valuesStartRepeat) {
                    if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                        this._valuesStartRepeat[property] =
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property])
                    }

                    if (this._yoyo) {
                        this._swapEndStartRepeatValues(property)
                    }

                    this._valuesStart[property] = this._valuesStartRepeat[property]
                }

                if (this._yoyo) {
                    this._reversed = !this._reversed
                }

                if (this._repeatDelayTime !== undefined) {
                    this._startTime = time + this._repeatDelayTime
                } else {
                    // this._startTime = time + this._delayTime
                    this._startTime = time
                }

                if (this._onRepeatCallback) {
                    this._onRepeatCallback(this._object)
                }

                this._onEveryStartCallbackFired = false

                return true
            } else {
                this._isPlaying = false

                for (const callback of this._onEndCallbacks) {
                    callback(this._object)
                }
                for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                    // Make the chained tweens start exactly at the time they should,
                    // even if the `update()` method was called way past the duration of the tween
                    this._chainedTweens[i].start(false, this._startTime + this._duration)
                }

                // callback may trigger a restart
                return this._isPlaying
            }
        }
        return true
    }

    protected _setupProperties(
        _object: UnknownProps,
        _valuesStart: UnknownProps,
        _valuesEnd: UnknownProps,
        _valuesStartRepeat: UnknownProps,
    ): void {
        for (const property in _valuesEnd) {
            const startValue = _object[property]
            const startValueIsArray = Array.isArray(startValue)
            const propType = startValueIsArray ? 'array' : typeof startValue
            const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property])

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (propType === 'undefined' || propType === 'function') {
                continue
            }

            // Check if an Array was provided as property value
            if (isInterpolationList) {
                let endValues = _valuesEnd[property] as Array<number | string>

                if (endValues.length === 0) {
                    continue
                }

                // handle an array of relative values
                endValues = endValues.map(this._handleRelativeValue.bind(this, startValue as number))

                // Create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [startValue].concat(endValues)
            }

            // handle the deepness of the values
            if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                _valuesStart[property] = startValueIsArray ? [] : {}

                // eslint-disable-next-line
                for (const prop in startValue as object) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStart[property][prop] = startValue[prop]
                }

                _valuesStartRepeat[property] = startValueIsArray ? [] : {} // TODO? repeat nested values? And yoyo? And array values?

                // eslint-disable-next-line
                // @ts-ignore FIXME?
                this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property])
            } else {
                // Save the starting value, [--but only once--].
                // NO WTF why only once if sometimes we want to reuse a tween???
                _valuesStart[property] = startValue

                if (!startValueIsArray) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStart[property] *= 1.0 // Ensures we're using numbers, not strings
                }

                if (isInterpolationList) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse()
                } else {
                    _valuesStartRepeat[property] = _valuesStart[property] || 0
                }
            }
        }
    }

    protected _updateProperties(
        _object: UnknownProps,
        _valuesStart: UnknownProps,
        _valuesEnd: UnknownProps,
        value: number,
    ): void {
        for (const property in _valuesEnd) {
            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue
            }

            const start = _valuesStart[property] || 0
            let end = _valuesEnd[property]
            const startIsArray = Array.isArray(_object[property])
            const endIsArray = Array.isArray(end)
            const isInterpolationList = !startIsArray && endIsArray

            if (isInterpolationList) {
                _object[property] = this._interpolationFunction(end as Array<number>, value)
            } else if (typeof end === 'object' && end) {
                // eslint-disable-next-line
                // @ts-ignore FIXME?
                this._updateProperties(_object[property], start, end, value)
            } else {
                // Parses relative end values with start as base (e.g.: +10, -3)
                end = this._handleRelativeValue(start as number, end as number | string)

                // Protect against non numeric properties.
                if (typeof end === 'number') {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    _object[property] = start + (end - start) * value
                }
            }
        }
    }

    protected _handleRelativeValue(start: number, end: number | string): number {
        if (typeof end !== 'string') {
            return end
        }

        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
            return start + parseFloat(end)
        } else {
            return parseFloat(end)
        }
    }

    protected _swapEndStartRepeatValues(property: string): void {
        const tmp = this._valuesStartRepeat[property]
        const endValue = this._valuesEnd[property]

        if (typeof endValue === 'string') {
            this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue)
        } else {
            this._valuesStartRepeat[property] = this._valuesEnd[property]
        }

        this._valuesEnd[property] = tmp
    }
}

export default vbTween