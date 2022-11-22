/**
 * Repo: https://github.com/arnoson/vite-plugin-live-reload
 */
import chokidar from 'chokidar'
import colors from 'picocolors'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'

// https://github.com/vitejs/vite/blob/03b323d39cafe2baabef74e6051a9640add82590/packages/vite/src/node/server/hmr.ts
function getShortName(file: string, root: string) {
  return file.startsWith(root + '/') ? path.posix.relative(root, file) : file
}

/** Plugin configuration */
export interface Config extends chokidar.WatchOptions {
  /**
   * Whether the page should be reloaded regardless of which file is modified.
   * @default false
   */
  alwaysReload?: boolean

  /**
   * Whether to log when a file change triggered a live reload
   * @default true
   */
  log?: boolean

  /**
    * File paths will be resolved against this directory.
    *
    * @default ViteDevServer.root
    * @internal
    */
  root?: string
}

/**
 * Reload all connected clients if one of the watched files changes or a new
 * file is added to a watched directory. This is useful when you are working
 * with a traditional backend and want to trigger page reloads when you are
 * changing for example php files.
 */
export const liveReload = (
  paths: string | readonly string[],
  config: Config = {}
): Plugin => ({
  name: 'vite-plugin-live-reload',

  configureServer({ ws, config: { root: viteRoot, logger } }: ViteDevServer) {
    const root = config.root || viteRoot

    const reload = (path: string) => {
      ws.send({ type: 'full-reload', path: config.alwaysReload ? '*' : path })
      if (config.log ?? true) {
        logger.info(
          colors.green(`page reload `) + colors.dim(getShortName(path, root)),
          { clear: true, timestamp: true }
        )
      }
    }

    chokidar
      .watch(paths, { cwd: root, ignoreInitial: true, ...config })
      .on('add', reload)
      .on('change', reload)
  }
})

export default liveReload