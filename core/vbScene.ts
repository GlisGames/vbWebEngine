import { isStructuralObjects, type StructuralObjectItem, type StructuralObjects, type vbGraphicObject } from '@vb/vbGraphicObject';
import type { StyleList } from './vbStyle';
import { isContainer, type vbContainer } from '@vb/vbContainer';
import type { TextStyleList } from './vbLocalization';
import type { StructuralPoints } from './vbTransform';


/**
 * Scene holds a collection of objects which shall be displayed
 * (i.e. shall be added to the container) \
 * The objects collection is described in `style.json`
 */
export class vbScene {
    protected _name: string;
    /**
     * "root objects" that shall be added to the root container,
     * their index in the array represents the layer.
     */
    rootObjs: vbGraphicObject[];
    /**
     * Collection of all objects in the scene which
     * respects the hierachical structure described in `style.json`
     */
    allObjs: StructuralObjects;

    constructor(name: string, rootObjs: vbGraphicObject[]) {
        this._name = name;
        this.rootObjs = rootObjs;
        this.allObjs = this._getAllObjectsRoot(rootObjs);
    }

    get name() { return this._name; }

    protected _getAllObjectsRoot(rootObjs: vbGraphicObject[]) {
        const list = pgame.currStyle.scenes[this.name];
        const allObjs: StructuralObjects = {};
        for (const obj of rootObjs) {
            const result = this._getAllObjects(obj, list);
            if (result !== undefined) {
                allObjs[obj.name] = result;
            }
        }
        return allObjs;
    }
    protected _getAllObjects(obj: vbGraphicObject, list: StyleList) {
        const styleItem = list[obj.name];
        if (styleItem === undefined) return undefined;

        let allObjs: StructuralObjectItem;
        if (!isContainer(obj) || !obj.isNestedStyle) {
            // it's not a `isNestedStyle` container
            // so simply return this object
            allObjs = obj;
        }
        else {
            // it's a `isNestedStyle` container, should search recursively
            // let its own object reference map with key string "container"
            allObjs = <StructuralObjects>{ 'container':obj };
            list = <StyleList>list[obj.name];
            for (const objName in list) {
                const child = obj.getReservedChildByName(objName);
                if (child === null) continue;

                const result = this._getAllObjects(<vbGraphicObject>child, list);
                if (result !== undefined) {
                    allObjs[child.name] = result;
                }
            }
        }
        return allObjs;
    }
}


/**
 * Scene transition gets the different objects between two scenes,
 * then remove and add those ones.
 */
export class vbSceneTransition {
    rootStage: vbContainer;
    fromScene: vbScene | null = null;
    toScene: vbScene;

    /** objects that only exist in from scene */
    fromObjs: StructuralObjects;
    /** objects that only exist in to scene */
    toObjs: StructuralObjects;
    /** objects that exist in both scenes */
    sameObjs: StructuralObjects;

    constructor(from: string | null, to: string) {
        this.rootStage = globalThis.pgame.stage;
        
        this.toScene = globalThis.pgame.getScene(to);
        if (from !== null) {
            this.fromScene = globalThis.pgame.getScene(from);
            this.fromObjs = vbSceneTransition.difference(this.fromScene.allObjs, this.toScene.allObjs);
            this.toObjs = vbSceneTransition.difference(this.toScene.allObjs, this.fromScene.allObjs);
            this.sameObjs = vbSceneTransition.intersection(this.fromScene.allObjs, this.toScene.allObjs);
        }
        else {
            this.fromObjs = {};
            this.toObjs = this.toScene.allObjs;
            this.sameObjs = {};
        }
    }

    /**
     * Add objects that don't exist on the current scene
     */
    enterNextScene() {
        globalThis.pgame.setScene(this.toScene);
        for (let i of Array.range(this.toScene.rootObjs.length)) {
            const obj = this.toScene.rootObjs[i];
            obj.layer = i;
        }
        const currStyles = globalThis.pgame.currStyle.list;
        const currTextStyles = globalThis.pgame.currLocale.styles;
        if (this.fromScene !== null) {
            this._recurseAddWithConfig(this.rootStage, this.toObjs, currStyles, currTextStyles);
        }
        else {
            this._recurseInitAddWithConfig(this.rootStage, this.toObjs, currStyles, currTextStyles);
        }
    }

    /**
     * Remove objects that don't exist on the next scene
     */
    exitCurrScene() {
        this._recurseRemove(this.rootStage, this.fromObjs);
    }

    transit() {
        this.exitCurrScene();
        this.enterNextScene();
    }

    /**
     * Recursively add objects with config,
     * we don't have to add those containers themselves since they are already added.
     */
    protected _recurseAddWithConfig(container: vbContainer, objs: StructuralObjects, styles: StyleList, textStyles?: TextStyleList) {
        for (const key in objs) {
            if (key == 'container') continue;
            const child = objs[key];

            if (isStructuralObjects(child)) {
                container = child['container'] as vbContainer;
                const nestedStyles = styles[container.name] as StyleList;
                const nestedTextStyles = textStyles !== undefined ? textStyles[container.name] as TextStyleList : undefined;
                this._recurseAddWithConfig(container, child, nestedStyles, nestedTextStyles);
            }
            else {
                container.addObjWithConfig(child, styles, textStyles);
            }
        }
    }

    /**
     * Special case for initial scene transition which "from scene" is null. \
     * Only root objects need to apply with config,
     * children are simply added then wait for root objects to apply with config. \
     * Containers also need to be added.
     */
    protected _recurseInitAddWithConfig(container: vbContainer, objs: StructuralObjects, styles: StyleList, textStyles?: TextStyleList) {
        for (const key in objs) {
            if (key == 'container') continue;
            const child = objs[key];
            
            if (isStructuralObjects(child)) {
                const childContainer = child['container'] as vbContainer;
                this._recurseInitAddObj(childContainer, child);
                container.addObjWithConfig(childContainer, styles, textStyles);
            }
            else {
                container.addObjWithConfig(child, styles, textStyles);
            }
        }
    }
    protected _recurseInitAddObj(container: vbContainer, objs: StructuralObjects) {
        for (const key in objs) {
            if (key == 'container') continue;
            const child = objs[key];
            
            if (isStructuralObjects(child)) {
                const childContainer = child['container'] as vbContainer;
                this._recurseInitAddObj(childContainer, child);
                container.addObj(childContainer);
            }
            else {
                container.addObj(child);
            }
        }
    }

    protected _recurseRemove(container: vbContainer, objs: StructuralObjects) {
        for (const key in objs) {
            if (key == 'container') continue;
            const child = objs[key];
            
            if (isStructuralObjects(child)) {
                const childContainer = child['container'] as vbContainer;
                this._recurseRemove(childContainer, child);
            }
            else {
                container.removeObj(child);
            }
        }
    }

    /**
     * Recursively search two objects to get an object that contains
     * those properties (only compare keys) which exist in `obj`, not in `other`.
     * 
     * @return see comments at the end of the file
     */
    static difference(objs: StructuralObjects, others: StructuralObjects) {
        const result: StructuralObjects = {};
        for (const key in objs) {
            const thisValue = objs[key];
            const otherValue = others[key];
            if (otherValue === undefined) {
                // other doesn't have it, add to result
                if ((thisValue as StructuralObjects)['container'] !== undefined)
                    result[key] = (thisValue as StructuralObjects)['container'];
                else
                    result[key] = thisValue;
            }
            else if (isStructuralObjects(thisValue)) {
                // both this and other objects have the property
                // but we need to search deeper
                const _result = vbSceneTransition.difference(thisValue, otherValue as StructuralObjects);
                if (Object.keys(_result).length > 0) {
                    // not an empty object, can be added
                    _result['container'] = thisValue['container'];
                    result[key] = _result;
                }
            }
        }
        return result;
    }

    /**
     * Recursively search two objects to get an object that contains
     * those properties (only compare keys) which exist in both `obj` and `other`.
     * 
     * @return see comments at the end of the file
     */
    static intersection(objs: StructuralObjects, others: StructuralObjects) {
        const result: StructuralObjects = {};
        for (const key in objs) {
            const thisValue = objs[key];
            const otherValue = others[key];
            if (otherValue === undefined) {
                // other doesn't have it, skip
                continue
            }
            else if (!isStructuralObjects(thisValue)) {
                // both this and other objects have the property
                // and we reach till the end, add it to result
                result[key] = thisValue;
            }
            else {
                // both this and other objects have the property
                // we need to search deeper
                const _result = vbSceneTransition.intersection(thisValue, otherValue as StructuralObjects);
                const resLen = Object.keys(_result).length
                if (resLen > 0) {
                    // not an empty object, can be added
                    result[key] = _result;
                }
            }
        }
        return result;    
    }

    /**
     * Get a structure with all the "xy" properties in styles. \
     * During scene transition, the objects only exist in `toScene` need to enter positions described in `style.json`.
     */
    static getEnterPositions(objs: StructuralObjects) {
        const positions: StructuralPoints = {};

        return positions;
    }

    /**
     * Get a structure with all the "exitXY" properties in styles. \
     * During scene transition, the objects only exist in `fromScene` need to exit positions described in `style.json`.
     */
    static getExitPositions(objs: StructuralObjects) {
        const positions: StructuralPoints = {};

        return positions;
    }

    /**
     * Get a structure with all the "xy" properties
     * that are not the same in `fromStyles` and `toStyles` for the same item. \
     * During scene transition, the objects shared with `fromScene` and `toScene` might need to move as described in `style.json`.
     */
    static getMovePositions(objs: StructuralObjects, fromStyles: StyleList, toStyles: StyleList) {
        const positions: StructuralPoints = {};

        return positions;
    }
}


/**
 * Example:

"fromScene": {
    "a": objA,
    "b": {
        "container": objB,
        "c": objC,
        "d": objD
    },
    "h": {
        "container": objH,
        "i": objI
    }
},

"toScene": {
    "b": {
        "container": objB,
        "d": objD,
        "e": {
            "container": objE,
            "f": objF
        }
    },
    "g": objG,
    "h": {
        "container": objH,
        "i": objI
    }
},

"fromDiff": {
    "a": objA,
    "b": {
        "container": objB,
        "c": objC,
    }
},

"toDiff": {
    "b": {
        "container": objB,
        "e": objE
    },
    "g": objG
},

"same" : {
    "b": {
        "container": objB,
        "d": objD
    },
    "h": {
        "container": objH,
        "i": objI
    }
}
*/
var _eg = undefined;