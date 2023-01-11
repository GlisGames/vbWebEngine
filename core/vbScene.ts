import type { RecursiveObjectItem, RecursiveObjectStructure, vbGraphicObject } from '@vb/vbGraphicObject';
import type { StyleList } from './vbStyle';
import type { vbContainer } from '@vb/vbContainer';


/**
 * Scene holds a list of objects which shall be added to the root container,
 * their index in the array represents the layer.
 */
export class vbScene {
    protected _name: string;
    rootObjs: vbGraphicObject[];
    /**
     * 
     */
    visibleObjs: RecursiveObjectStructure;

    constructor(name: string, rootObjs: vbGraphicObject[]) {
        this._name = name;
        this.rootObjs = rootObjs;
        this.visibleObjs = this._getVisibleObjectsRoot(rootObjs);
    }

    get name() { return this._name; }

    protected _getVisibleObjectsRoot(rootObjs: vbGraphicObject[]) {
        const visibleObjs: RecursiveObjectStructure = {};
        for (const obj of rootObjs) {
            // for root objs, only accept `isNestedStyle` container
            const container = <vbContainer>obj;
            if (container.desz === undefined || !container.isNestedStyle) continue;

            const result = this._getVisibleObject(obj, pgame.currStyle.list);
            if (result !== undefined) {
                visibleObjs[obj.name] = result;
            }
        }
        return visibleObjs;
    }
    protected _getVisibleObject(obj: vbGraphicObject, list: StyleList) {
        const styleItem = list[obj.name];
        if (styleItem === undefined) return undefined;

        let visibleObjs: RecursiveObjectItem;
        const container = <vbContainer>obj;
        if (container.desz === undefined || !container.isNestedStyle) {
            // it's not a `isNestedStyle` container
            // so simply return this object
            visibleObjs = obj;
        }
        else {
            // it's a `isNestedStyle` container, should search recursively
            // let its own object reference map with key string "obj"
            visibleObjs = <RecursiveObjectStructure>{ "obj":obj };
            list = <StyleList>list[container.name];
            for (const objName in list) {
                const child = container.getChildByName(objName, true);
                if (child === null) continue;

                const result = this._getVisibleObject(<vbGraphicObject>child, list);
                if (result !== undefined) {
                    visibleObjs[child.name] = result;
                }
            }
        }
        return visibleObjs;
    }
}


/**
 * Scene transition gets the different objects between two scenes,
 * then remove and add those ones.
 */
export class vbSceneTransition {
    rootStage: vbContainer;
    toScene: vbScene;
    fromDiffObjs: vbGraphicObject[] = [];
    toDiffObjs: vbGraphicObject[] = [];

    constructor(from: string | null, to: string) {
        this.rootStage = globalThis.pgame.stage;
        this.toScene = globalThis.pgame.getScene(to);
        this._calcDiff(from);
    }

    protected _calcDiff(from: string | null) {
        if (from !== null) {
            const fromScene = globalThis.pgame.getScene(from);
            for (const fromObj of fromScene.rootObjs) {
                if (this.toScene.rootObjs.includes(fromObj))
                    continue;
                else
                    this.fromDiffObjs.push(fromObj);
            }
            for (const toObj of this.toScene.rootObjs) {
                if (fromScene.rootObjs.includes(toObj))
                    continue;
                else
                    this.toDiffObjs.push(toObj);
            }
        }
        else {
            this.toDiffObjs = this.toScene.rootObjs;
        }
    }

    /**
     * Add objects that don't exist on the current scene
     */
    enterNextScene() {
        globalThis.pgame.setScene(this.toScene);

        for (const vbObj of this.toDiffObjs) {
            this.rootStage.addObjWithConfig(vbObj);
        }
        // change layers...
        for (let i of Array.range(this.toScene.rootObjs.length)) {
            const vbObj = this.toScene.rootObjs[i];
            vbObj.layer = i;
        }
    }

    /**
     * Remove objects that don't exist on the next scene
     */
    exitCurrScene() {
        for (const vbObj of this.fromDiffObjs) {
            this.rootStage.removeObj(vbObj);
        }
    }

    transit() {
        this.exitCurrScene();
        this.enterNextScene();
    }
}
