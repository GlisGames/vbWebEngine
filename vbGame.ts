import * as PIXI from 'pixi.js';
import { load_json, load_jsons, get_multipack_sequenceMap, load_textures, get_textureMap, AssetList } from './misc/vbLoader'
import { Styles, vbGraphicObject } from './vbGraphicObject';
import { vbContainer } from './vbContainer';
import { vbState } from './vbState';
import { getLanguageObject, vbText } from './renderable/vbText';
import { vb } from './vbUtils'


/** Override the main stage type to vbContainer */
export class vbApplication extends PIXI.Application {
    stage = new vbContainer();
}


/**
 * Has the main PixiJS application,
 * managing all the assets, states, etc...
 */
export abstract class vbGame {
    /** main stage: app.stage */
    static app = new vbApplication({
        sharedLoader: true,
        sharedTicker: true,
        antialias: true
    });
    static desiredResolution = new PIXI.Point();
    static textureMap: { [name: string]: PIXI.Texture } = {};
    static sequenceMap: { [name: string]: PIXI.Texture[] } = {};
    static currentStyle = {} as Styles;
    static styleMap: { [name: string]: Styles } = {};
    static currentState = {} as vbState;
    static states: { [stateType: number]: vbState } = {};
    static _txtFPS?: FPSCounter;


    static async loadAssets() {
        // set the whole screen interactive so it can be clicked
        this.app.stage.name = 'MainStage';
        this.app.stage.interactive = true;

        // file list json has all the assets that need to be fetched
        let assets = <AssetList>(await load_json('list.json'));
        let loader = this.app.loader;
        this.desiredResolution.x = 1280; this.desiredResolution.y = 720;
        this.setResolution();

        await load_textures(loader, assets);
        this.textureMap = get_textureMap(loader, assets);
        this.sequenceMap = get_multipack_sequenceMap(loader, assets);
    };

    static addState(state: vbState) {
        this.states[state.stateType] = state;
        this.app.stage.addObj(state.container, 1);
    }

    /**
     * Recursively apply current style to all objects. \
     * The containers added to the main stage are root containers.
     */
    static applyCurrentStlye() {
        let rootStyle = this.currentStyle['root'];

        for (let obj of this.app.stage.children) {
            let vbObj = <vbGraphicObject>obj;
            vbObj.applyStyle(rootStyle[vbObj.name]);
            if (!(vbObj instanceof vbContainer)) continue;
            let container = <vbContainer>obj;
            // get root container style
            let style = this.currentStyle[container.name];
            container.applyChildrenStyle(style);
        }
    }

    static setCurrentLanguage() {
        this.app.stage.setLanguage('');
    }
    
    /**
     * Set renderer size and resize callback based on designedResolution
     */
    static setResolution() {
        let ratio = this.desiredResolution.y / this.desiredResolution.x;
        const resizeApp = () => {
            let resizedWidth = Math.min(this.desiredResolution.x, window.innerWidth);
            // Simply scale the stage instead of adapting it.
            let scale = resizedWidth / this.desiredResolution.x;
            this.app.renderer.resize(resizedWidth, resizedWidth * ratio);
            this.app.stage.scale.set(scale);
        }
        
        resizeApp();
        window.addEventListener('resize', (e) => {
            resizeApp();
        });
    };

    static showFPS() {
        if (this._txtFPS !== undefined) return;
        this._txtFPS = new FPSCounter();
        this._txtFPS.x = this.desiredResolution.x - 50;
        this._txtFPS.y = 0;
        this.app.stage.addObj(this._txtFPS, vbContainer.maxLayer + 1);
    }
}


export function getDeltaMS() {
    return vbGame.app.ticker.elapsedMS;
}

export function getTotalMS() {
    return performance.now();
}

export function getFPS() {
    return vbGame.app.ticker.FPS;
}


/** Show the average over N_FRAME */
class FPSCounter extends vbText {
    static N_FRAME = 10;
    totalFrames = 0;
    totalFPS = 0;

    constructor() {
        super('Arial', 20, vb.Green);
        this.style.dropShadow = true;
        this.style.dropShadowColor = vb.Black;
        this.style.dropShadowDistance = 4;
    }

    update(deltaFrame: number) {
        this.totalFrames++;
        this.totalFPS += getFPS();
        if (this.totalFrames >= FPSCounter.N_FRAME) {
            this.text = (this.totalFPS / this.totalFrames).toFixed(0);
            this.totalFrames = 0;
            this.totalFPS = 0;
        }
    }
}
