import vbTween from './vbTween'


// eslint-disable-next-line
type UnknownProps = Record<string, any>

/**
 * Controlling groups of tweens
 */
class vbTweenGroup {
    protected _twMap?: Map<string, vbTween<UnknownProps>>
    protected _tweensAddedDuringUpdate?: Map<string, vbTween<UnknownProps>>

    /**
     * @param [name] Cannot be duplicated
     * @param [obj] Owner object of the properties in `to`
     * @param [to] A collection of properties from `obj`.
     * @param [duration] Time in ms.
     */
    create<T extends UnknownProps>(name: string, obj: T, to: UnknownProps, duration=1000) {
        const tw = new vbTween(name, obj, this).to(to, duration)
        // eslint-disable-next-line
        this.add(<any>tw)
        return tw
    }
    // eslint-disable-next-line
    getByName(name: string): vbTween<any> | undefined {
        return this._twMap?.get(name)
    }
    size() {
        if (this._twMap === undefined) return 0
        else return this._twMap.size
    }

    add(tween: vbTween<UnknownProps>): void {
        if (this._twMap === undefined || this._tweensAddedDuringUpdate === undefined) {
            this._twMap = new Map<string, vbTween<UnknownProps>>()
            this._tweensAddedDuringUpdate = new Map<string, vbTween<UnknownProps>>()
        }
        this._twMap.set(tween.name, tween)
        this._tweensAddedDuringUpdate.set(tween.name, tween)
    }

    remove(tween: vbTween<UnknownProps>): void {
        this._twMap?.delete(tween.name)
        this._tweensAddedDuringUpdate?.delete(tween.name)
    }

    getAll(): vbTween<UnknownProps>[] {
        if (this._twMap !== undefined)
            return [...this._twMap.values()]
        else return []
    }
    removeAll(): void {
        this._twMap?.clear()
        this._tweensAddedDuringUpdate?.clear()
    }
    endAll(): void {
        this.update(Infinity)
    }

    update(time: number): void {
        if (this._twMap === undefined || this._twMap.size == 0 || this._tweensAddedDuringUpdate === undefined) return

        let tweenIds = [...this._twMap.keys()]
        // Tweens are updated in "batches". If you add a new tween during an
        // update, then the new tween will be updated in the next batch.
        // If you remove a tween during an update, it may or may not be updated.
        // However, if the removed tween was added during the current batch,
        // then it will not be updated.
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate.clear()

            for (const name of tweenIds) {
                const tween = this._twMap.get(name)
                if (tween !== undefined && tween.update(time) === false) {
                    this._twMap.delete(tween.name)
                }
            }

            tweenIds = [...this._tweensAddedDuringUpdate.keys()]
        }
    }

    updateTillEnd(): void {
        if (this._twMap === undefined || this._twMap.size == 0 || this._tweensAddedDuringUpdate === undefined) return

        let tweenIds = [...this._twMap.keys()]
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate.clear()

            for (const name of tweenIds) {
                const tween = this._twMap.get(name)
                if (tween !== undefined) {
                    tween.updateTillEnd()
                    this._twMap.delete(tween.name)    
                }
            }

            tweenIds = [...this._tweensAddedDuringUpdate.keys()]
        }
    }
}

export default vbTweenGroup