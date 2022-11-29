import * as PIXI from 'pixi.js';
import type { AssetList } from './misc/vbLoader';
import { FPSCounter } from './renderable/vbDemoItems';
import type { LocalizationTable } from './core/vbLocalization';
import type { STYPE } from '@g/states/StateTypes';
import type { SpineData } from './renderable/vbSpineObject';
import type { StyleTable } from './core/vbStyle';
import { get_SpineMap, get_localeMap, get_multipack_sequenceMap, get_styleMap, get_textureMap, load_assets, load_json } from './misc/vbLoader'
import { vbContainer } from './vbContainer';
import { vbSoundManager, vbSoundManagerInstance } from './misc/vbSound';
import type { vbState } from './core/vbState';
import { vbTimer, vbTimerManager } from './vbTimer';


type StateMap = { [stateName: string]: vbState };
type StyleMap = { [name: string]: StyleTable };
type TextureMap = { [name: string]: PIXI.Texture };
type SequenceMap = { [name: string]: PIXI.Texture[] };
type SpineMap = { [name: string]: SpineData };
type LocaleMap = { [code: string]: LocalizationTable };
/**
 * Has the main PixiJS application,
 * managing all the assets, states, etc...
 */
export abstract class vbGame extends PIXI.Application {
    stage = (() => {
        let stage = new vbContainer();
        stage.name = 'MainStage';
        // set the whole screen interactive so it can be clicked
        stage.interactive = true;
        return stage;
    })();

    timers = new vbTimerManager();
    desiredWidth = 0;
    desiredHeight = 0;
    /** height / width */
    desiredRatio = 0;
    /**
     * The resize callback that should be called 
     * everytime when the desiredResolution has changed, (style change, etc.) \
     * And also can be added to window event listener.
     */
    resizeAppFn = (contentWidth: number, contentHeight: number) => { };

    /** current state */
    currState = {} as vbState;
    states: StateMap = {};
    /** current style */
    currStyle = {} as StyleTable;
    styles: StyleMap = {};
    /** current locale */
    currLocale = {} as LocalizationTable;
    locales: LocaleMap = {};

    textures: TextureMap = {};
    sequences: SequenceMap = {};
    spines: SpineMap = {};
    sounds = {} as vbSoundManager;


    async initAssets() {
        // file list json has all the assets that need to be fetched
        let assets = <AssetList>(await load_json('assets-list.json'));
        let loader = this.loader;
        await load_assets(loader, assets);

        this.textures = get_textureMap(loader, assets);
        this.sequences = get_multipack_sequenceMap(loader, assets);
        this.spines = get_SpineMap(loader, assets);
        this.styles = get_styleMap(loader, assets);
        this.sounds = vbSoundManagerInstance;
        this.locales = get_localeMap(loader, assets);
    }

    mainLoop(deltaFrame: number) { }

    startLoop() {
        this.mainLoop = this.mainLoop.bind(this);
        if (!DEV || (this.ticker.count < 2)) {
            // for some reasons, when vite hot reload the vue setup script,
            // it may cause the ticker weirdly add more and more mainLoop callbacks
            // without initializing everything from empty.
            // this check is used for preventing redundant callbacks.
            this.ticker.add(this.mainLoop);
        }
    }

    addState(state: vbState) {
        this.states[state.name] = state;
    }
    setState(stateName: STYPE) {
        this.currState = this.states[stateName];
    }
    setStyle(name: string) {
        this.currStyle = this.styles[name];
    }
    setLocale(code: string) {
        this.currLocale = this.locales[code];
    }

    setResolution(width: number, height: number) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.desiredRatio = height / width;
        this.resizeAppFn(width, height);
        if (this._txtFPS !== undefined) {
            this._txtFPS.x = width - 40;
        }
        // set the size of main container as well
        this.stage.setDesiredSize(width, height);
    }

    /**
     * Creates an instance of Timer that is running at any time.
     *
     * @param [time] The time is ms before timer end or repedeated.
     * @param [repeat] Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param [delay] Delay in ms before timer starts (default 0)
     * @param [preserved] Normal timer will only be added to the TimerManager when it's running, and will be removed when it's ended. \
     *              Preserved timer will stay to avoid constantly being added or removed.
     */
    createGlobalTimer(time: number, repeat = 0, delay = 0, preserved = false) {
        return new vbTimer(this.timers, time, repeat, delay, preserved);
    }

    applyCurrentStlye() {
        this.stage.applyChildrenStyle(this.currStyle.list);
    }

    applyCurrentLocale() {
        this.stage.localizeChildren(this.currLocale);
    }

    get DeltaMS() {
        return this.ticker.elapsedMS;
    }

    get TotalMS() {
        return performance.now();
    }

    get FPS() {
        return this.ticker.FPS;
    }

    protected _txtFPS?: FPSCounter;
    showFPS() {
        if (this._txtFPS !== undefined) return;
        this._txtFPS = new FPSCounter();
        this._txtFPS.x = this.desiredWidth - 40;
        this._txtFPS.y = 0;
        this.stage.addObj(this._txtFPS, vbContainer.maxLayer + 1);
    }
}
