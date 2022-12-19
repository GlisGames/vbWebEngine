import type { vbContainer } from '@vb/vbContainer';
import type { vbGraphicObject } from '@vb/vbGraphicObject';


/**
 * Scene holds a list of objects which their index represents the layer
 */
export class vbScene {
    protected _name: string;
    vbObjs: vbGraphicObject[];

    constructor(name: string, objects: vbGraphicObject[]) {
        this._name = name;
        this.vbObjs = Object.values(objects);
    }

    get name() { return this._name; }
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
            for (const fromObj of fromScene.vbObjs) {
                if (this.toScene.vbObjs.includes(fromObj))
                    continue;
                else
                    this.fromDiffObjs.push(fromObj);
            }
            for (const toObj of this.toScene.vbObjs) {
                if (fromScene.vbObjs.includes(toObj))
                    continue;
                else
                    this.toDiffObjs.push(toObj);
            }
        }
        else {
            this.toDiffObjs = this.toScene.vbObjs;
        }
    }

    /**
     * Add objects that don't exist on the current scene
     */
    enterNextScene() {
        for (const vbObj of this.toDiffObjs) {
            this.rootStage.addObjWithConfig(vbObj);
        }
        // change layers...
        for (let i of Array.range(this.toScene.vbObjs.length)) {
            const vbObj = this.toScene.vbObjs[i];
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
