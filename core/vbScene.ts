import type { vbContainer } from '@vb/vbContainer';
import type { vbGraphicObject } from '@vb/vbGraphicObject';


/**
 * Right now the scene itself doesn't do anything...
 */
export class vbScene {
    protected _name: string;
    vbObjs: vbGraphicObject[];

    constructor(name: string, objects: { [varName: string]: vbGraphicObject }) {
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
    fromDiffObjs: vbGraphicObject[];
    toDiffObjs: vbGraphicObject[];

    constructor(rootStage: vbContainer, from: vbScene | null, to: vbScene) {
        this.rootStage = rootStage;
        this.fromDiffObjs = [];
        this.toDiffObjs = [];
        if (from !== null) {
            for (let fromObj of from.vbObjs) {
                if (to.vbObjs.includes(fromObj))
                    continue;
                else
                    this.fromDiffObjs.push(fromObj);
            }
            for (let toObj of to.vbObjs) {
                if (from.vbObjs.includes(toObj))
                    continue;
                else
                    this.toDiffObjs.push(toObj);
            }
        }
        else {
            this.toDiffObjs = to.vbObjs;
        }
    }

    /**
     * Add objects that don't exist on the current scene
     */
    enterNextScene() {
        for (let vbObj of this.toDiffObjs) {
            this.rootStage.addObjWithConfig(vbObj);
        }
    }

    /**
     * Remove objects that don't exist on the next scene
     */
    exitCurrScene() {
        for (let vbObj of this.fromDiffObjs) {
            this.rootStage.removeObj(vbObj);
        }
    }

    transit() {
        this.exitCurrScene();
        this.enterNextScene();
    }
}
