import * as PIXI from 'pixi.js';
import type { AssetList } from './misc/vbLoader';
import { FPSCounter } from './renderable/vbDemoItems';
import type { LocalizationTable } from './core/vbLocalization';
import type { STYPE } from '@g/states/StateTypes';
import type { SpineData } from './renderable/vbSpineObject';
import type { StyleTable } from './core/vbStyle';
import { c, shared } from './misc/vbShared';
import { get_SpineMap, get_localeMap, get_multipack_sequenceMap, get_styleMap, get_textureMap, load_assets, load_json } from './misc/vbLoader'
import { vbContainer } from './vbContainer';
import { vbInteractionManager } from './core/vbInteraction';
import { vbPrimitive, vbRectangle } from './renderable/vbPrimitive';
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
    stage = new vbContainer();
    /** an invisible rectangle used for interaction */
    protected _bgRect: vbPrimitive;

    timers = new vbTimerManager();
    interaction: vbInteractionManager;
    
    desiredWidth = 0;
    desiredHeight = 0;
    /** height / width */
    desiredRatio = 0;
    /**
     * The resize callback that should be called 
     * everytime when the desiredResolution has changed, (style change, etc.) \
     * And also can be added to window event listener.
     */
    resizeAppFn = (contentWidth: number, contentHeight: number) => {};

    /** current state */
    currState = {} as vbState;
    protected _states: StateMap = {};
    /** current style */
    currStyle = {} as StyleTable;
    protected _styles: StyleMap = {};
    /** current locale */
    currLocale = {} as LocalizationTable;
    protected _locales: LocaleMap = {};

    protected _textures: TextureMap = {};
    protected _sequences: SequenceMap = {};
    protected _spines: SpineMap = {};
    sounds = {} as vbSoundManager;

    /**
     * https://pixijs.download/v6.5.8/docs/PIXI.Application.html
     * @param {object} [options] - The optional application parameters.
     */
    constructor(options?: PIXI.IApplicationOptions) {
        PIXI.settings.RESOLUTION = window.devicePixelRatio;
        PIXI.settings.FILTER_RESOLUTION = window.devicePixelRatio;
        super(options);

        this.interaction = new vbInteractionManager(this.timers);
        shared.init();

        this.stage.name = 'MainStage';
        // set the whole screen interactive so it can be clicked
        this.stage.interactive = true;
        // add the invisible rectangle to stage;
        let rect = new vbRectangle(100, 100).fill(c.White, 0);
        this._bgRect = new vbPrimitive(rect);
        this.stage.addObj(this._bgRect, -9998);
    }
    
    async initAssets() {
        // file list json has all the assets that need to be fetched
        let assets = <AssetList>(await load_json('assets-list.json'));
        let loader = this.loader;
        await load_assets(loader, assets);

        this._textures = get_textureMap(loader, assets);
        this._sequences = get_multipack_sequenceMap(loader, assets);
        this._spines = get_SpineMap(loader, assets);
        this._styles = get_styleMap(loader, assets);
        this.sounds = vbSoundManagerInstance;
        this._locales = get_localeMap(loader, assets);
    }

    mainLoop(deltaFrame: number) { }

    startLoop() {
        this.mainLoop = this.mainLoop.bind(this);
        if (!DEV || (this.ticker.count < 2)) {
            // for some reasons, vite's module hot reload doesn't work well on pixi,
            // it may cause the ticker weirdly add more and more mainLoop callbacks
            // without initializing everything from empty.
            // this check is used for preventing redundant callbacks.
            this.ticker.add(this.mainLoop, {}, PIXI.UPDATE_PRIORITY.HIGH);
        }
    }

    setResolution(width: number, height: number) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.desiredRatio = height / width;
        if (this._txtFPS !== undefined) {
            this._txtFPS.x = width - 40;
        }
        this._bgRect.width = width;
        this._bgRect.height = height;
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

    addState(state: vbState) {
        this._states[state.name] = state;
    }
    getState(stateName: STYPE) {
        const r = this._states[stateName];
        if (r === undefined) throw ReferenceError(`Cannot find state ${stateName}`);
        return r;
    }
    setState(stateName: STYPE) {
        this.currState = this.getState(stateName);
    }
    getStyle(name: string) {
        const r = this._styles[name];
        if (r === undefined) throw ReferenceError(`Cannot find style ${name}`);
        return r;
    }
    setStyle(name: string) {
        this.currStyle = this.getStyle(name);
    }
    getLocale(code: string) {
        const r = this._locales[code];
        if (r === undefined) throw ReferenceError(`Cannot find locale ${code}`);
        return r;
    }
    setLocale(code: string) {
        this.currLocale = this.getLocale(code);
    }

    getTex(name: string) {
        const r = this._textures[name];
        if (r === undefined) throw ReferenceError(`Cannot find texture ${name}`);
        return r;
    }
    getSeq(name: string) {
        const r = this._sequences[name];
        if (r === undefined) throw ReferenceError(`Cannot find sequence ${name}`);
        return r;
    }
    getSpine(name: string) {
        const r = this._spines[name];
        if (r === undefined) throw ReferenceError(`Cannot find spine ${name}`);
        return r;
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
