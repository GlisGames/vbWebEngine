import * as PIXI from 'pixi.js';
import { c } from './vbMisc';
import { load_json, AssetList, load_assets, get_textureMap, get_multipack_sequenceMap, get_styleMap, get_localeMap, get_SpineMap } from './misc/vbLoader'
import { StyleList } from './vbGraphicObject';
import { vbContainer } from './vbContainer';
import { vbState } from './vbState';
import { vbTimer, vbTimerManager } from './vbTimer';
import { LocalizationTable, vbText } from './renderable/vbText';
import { vbSoundManager, vbSoundManagerInstance } from './misc/vbSound';
import { SpineData } from './renderable/vbSpineObject';


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
type StateMap = { [stateType: number]: vbState };
type StyleMap = { [name: string]: StyleList };
type TextureMap = { [name: string]: PIXI.Texture };
type SequenceMap = { [name: string]: PIXI.Texture[] };
type SpineMap = { [name: string]: SpineData };
type LocaleMap = { [code: string]: LocalizationTable };
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
    resizeAppFn = (e?: UIEvent) => {};

    currentState = {} as vbState;
    states: StateMap = {};

    currentStyle = {} as StyleList;
    currentStyleName = '';
    styles: StyleMap = {};
    
    textures: TextureMap = {};
    sequences: SequenceMap = {};
    spines: SpineMap = {};
    sounds = {} as vbSoundManager;

    currentLocale = {} as LocalizationTable;
    locales: LocaleMap = {};


    async initAssets() {
        // file list json has all the assets that need to be fetched
        let assets = <AssetList>(await load_json('list.json'));
        let loader = this.app.loader;
        await load_assets(loader, assets);

        this.textures = get_textureMap(loader, assets);
        this.sequences = get_multipack_sequenceMap(loader, assets);
        this.spines = get_SpineMap(loader, assets);
        this.styles = get_styleMap(loader, assets);
        this.sounds = vbSoundManagerInstance;
        this.locales = get_localeMap(loader, assets);
    };

    /**
     * @param [layer] The layer which state's container will be in. Default 1.
     */
    addState(state: vbState, layer = 1) {
        this.states[state.sType] = state;
        this.app.stage.addObj(state.stage, layer);
    }

    setState(stateType: number) {
        this.currentState = this.states[stateType];
    }
    setStyle(name: string) {
        this.currentStyle = this.styles[name];
    }
    setLocale(code: string) {
        this.currentLocale = this.locales[code];
    }
    
    setResolution(width: number, height: number) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.desiredRatio = height / width;
        this.resizeAppFn();
        if (this._txtFPS !== undefined) {
            this._txtFPS.x = width - 40;
        }
        // set the size of main container as well
        this.app.stage.setDesiredSize(width, height);
    };

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

    applyCurrentStlye() {
        this.app.stage.applyChildrenStyle(this.currentStyle);
    }

    applyCurrentLocale() {
        this.app.stage.localizeChildren(this.currentLocale.list);
    }

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
        super({font: 'Arial', size: 20, color: c.Green});
        this.style.dropShadow = true;
        this.style.dropShadowColor = c.Black;
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
