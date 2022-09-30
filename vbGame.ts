import * as PIXI from 'pixi.js';
import { load_json, AssetList, load_assets, get_textureMap, get_multipack_sequenceMap, get_styleMap } from './misc/vbLoader'
import { StyleList } from './vbGraphicObject';
import { vbContainer } from './vbContainer';
import { vbState } from './vbState';
import { vbText } from './renderable/vbText';
import { vb } from './vbUtils'
import { vbTimer, vbTimerManager } from './vbTimer';


/** Override the main stage type to vbContainer */
export class vbApplication extends PIXI.Application {
    stage = (() => {
        let stage = new vbContainer();
        stage.name = 'MainStage';
        // set the whole screen interactive so it can be clicked
        stage.interactive = true;
        return stage;
    })();
}


/**
 * A global reference pointer that should only be used in Engine code.
 * When the actual game initializes its game object, it should set this pointer.
 */
export var vbgame = {} as _vbGame;
export function set_vbgame(g: _vbGame) { vbgame = g; }
/**
 * Has the main PixiJS application,
 * managing all the assets, states, etc...
 */
export abstract class _vbGame {
    /** main stage: app.stage */
    app = new vbApplication({
        sharedLoader: true,
        sharedTicker: true,
        antialias: true
    });

    timers = new vbTimerManager();
    desiredWidth = 0;
    desiredHeight = 0;
    desiredRatio = 0;
    /**
     * The resize callback that should be called 
     * everytime when the desiredResolution has changed, (style change, etc.) \
     * And also can be added to window event listener.
     */
    resizeApp = (e?: UIEvent) => {};

    currentState = {} as vbState;
    states: { [stateType: number]: vbState } = {};

    currentStyle = {} as StyleList;
    currentStyleName = '';
    styleMap: { [name: string]: StyleList } = {};
    
    textureMap: { [name: string]: PIXI.Texture } = {};
    sequenceMap: { [name: string]: PIXI.Texture[] } = {};


    async initAssets() {
        // file list json has all the assets that need to be fetched
        let assets = <AssetList>(await load_json('list.json'));
        let loader = this.app.loader;
        await load_assets(loader, assets);

        this.textureMap = get_textureMap(loader, assets);
        this.sequenceMap = get_multipack_sequenceMap(loader, assets);
        this.styleMap = get_styleMap(loader, assets);
    };

    addState(state: vbState) {
        this.states[state.stateType] = state;
        this.app.stage.addObj(state.container, 1);
    }

    /**
     * State timers are running only when this is the current state.
     * 
     * @param [stateType] If it's not specified, add to the current state.
     */
    addStateTimer(timer: vbTimer, stateType?: number) {
        if (stateType !== undefined) {
            this.states[stateType].timers.addTimer(timer);
        }
        else {
            this.currentState.timers.addTimer(timer);
        }
    }

    /**
     * Global timers, running at any time.
     */
    addGlobalTimer(timer: vbTimer) {
        this.timers.addTimer(timer);
    }

    /**
     * Recursively apply current style to all objects.
     */
    applyCurrentStlye() {
        this.app.stage.applyChildrenStyle(this.currentStyle);
    }

    setCurrentLanguage() {
        this.app.stage.setLocale('');
    }
    
    setResolution(width: number, height: number) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.desiredRatio = height / width;
        this.resizeApp();
        if (this._txtFPS !== undefined) {
            this._txtFPS.x = width - 40;
        }
    };

    get DeltaMS() {
        return this.app.ticker.elapsedMS;
    }

    get TotalMS() {
        return performance.now();
    }

    get FPS() {
        return this.app.ticker.FPS;
    }

    protected _txtFPS?: FPSCounter;
    showFPS() {
        if (this._txtFPS !== undefined) return;
        this._txtFPS = new FPSCounter();
        this._txtFPS.x = this.desiredWidth - 40;
        this._txtFPS.y = 0;
        this.app.stage.addObj(this._txtFPS, vbContainer.maxLayer + 1);
    }
}


/** Show the average over N_FRAME */
class FPSCounter extends vbText {
    static N_FRAME = 10;
    protected totalFrames = 0;
    protected totalFPS = 0;

    constructor() {
        super('Arial', 20, vb.Green);
        this.style.dropShadow = true;
        this.style.dropShadowColor = vb.Black;
        this.style.dropShadowDistance = 4;
    }

    update(deltaFrame: number) {
        this.totalFrames++;
        this.totalFPS += vbgame.FPS;
        if (this.totalFrames >= FPSCounter.N_FRAME) {
            this.text = (this.totalFPS / this.totalFrames).toFixed(0);
            this.totalFrames = 0;
            this.totalFPS = 0;
        }
    }
}
