import { spawn } from "child_process";
import { BaseWindow, WebContentsView, Rectangle } from "electron";
import { Window, windowManager } from "node-window-manager";
import SpotifyMonkeyProcess from "./main";


export default class Monkey {

    private readonly process: SpotifyMonkeyProcess;

    private nexusWindow: Window;
    private pathToExe: string;

    public isShown: boolean;
    public appWindow: Window;

    private readonly MINIMIZED_WIDTH: number = 160




    public constructor(process: SpotifyMonkeyProcess, pathToExe: string, isShown: boolean, closeOnExit: boolean) {
        this.process = process;

        windowManager.on('window-activated', this.onWindowChange.bind(this))

        this.pathToExe = pathToExe;
        this.isShown = isShown;
        this.nexusWindow = windowManager.getWindows().find(win => win.getTitle() === "Nexus");
        const existingWindow: Window = this.findBestWindow();

        if (existingWindow === undefined) {
            console.info("🐒 Spotify Monkey: Making a new Spotify instance.")
            spawn(this.pathToExe, [], { detached: !closeOnExit })
                .on('error', (err) => {
                    console.error(err)
                });

            this.waitForRealWindow().then((appWindow: Window) => {
                this.attachHandlersToWindow(appWindow);
            }).catch(err => {
                console.error(err);
            });

        } else {
            console.info("🐒 Spotify Monkey: Existing Spotify instance found.");
            this.attachHandlersToWindow(existingWindow);
        }
    }

    private onWindowChange(window: Window) {
        if (window.path === this.pathToExe) { // activated window, swap modules?
            if (BaseWindow.getAllWindows()[0].isMinimized()) {
                BaseWindow.getAllWindows()[0].restore();
            }

            this.process.requestExternal("nexus.Main", "swap-to-module");
        }
    }

    public cleanup() {
        windowManager.removeAllListeners();
    }

    private waitForRealWindow(timeout: number = 10000, interval: number = 200): Promise<Window> {
        return new Promise((resolve, reject) => {
            const startMS: number = Date.now();

            const check = () => {
                const best: Window | undefined = this.findBestWindow();
                if (best !== undefined) {
                    return resolve(best);
                }

                if (Date.now() - startMS >= timeout) {
                    return reject('🐒 Spotify Monkey: Could not find the Spotify window found within timeout.');
                }

                setTimeout(check, interval);
            };

            check();
        });
    }


    private attachHandlersToWindow(appWindow: Window) {
        this.appWindow = appWindow;

        if (!this.isShown) {
            this.hide();
        } else {
            this.show();
        }

        appWindow.setOwner(this.nexusWindow);

        this.resize();

        BaseWindow.getAllWindows()[0].contentView.children[0].on('bounds-changed', () => {
            this.resize();
        })
        BaseWindow.getAllWindows()[0].on('resize', () => {
            this.resize();
        })
        BaseWindow.getAllWindows()[0].on('move', () => {
            this.resize();
        })
    }

    public isMinimized(): boolean {
        return this.appWindow?.getBounds().width === this.MINIMIZED_WIDTH;
    }

    public show() {
        this.appWindow?.show();
        this.appWindow?.restore()
        this.resize()
    }

    public hide() {
        this.appWindow?.hide();
    }


    public resize() {
        const windowZoom: number = (BaseWindow.getAllWindows()[0].contentView.children[0] as WebContentsView).webContents.zoomFactor;
        const windowContentBounds: Rectangle = BaseWindow.getAllWindows()[0].getContentBounds();

        if (this.isMinimized()) {
            if (this.isShown) {
                this.appWindow.restore()
            } else {
                return;
            }
        }


        this.appWindow?.setBounds({
            x: windowContentBounds.x + (70 * windowZoom),
            y: windowContentBounds.y,
            width: windowContentBounds.width - (70 * windowZoom),
            height: windowContentBounds.height,
        });
    }

    private findBestWindow(): Window | undefined {
        const candidates: Window[] = windowManager.getWindows().filter(w => {
            return w.path.toLowerCase() === this.pathToExe.replace(/\//g, "\\").toLowerCase() && w.isVisible()
        });

        if (candidates.length > 0) {
            const best: Window = candidates.sort((a, b) => {
                const aArea: number = a.getBounds().width * a.getBounds().height;
                const bArea: number = b.getBounds().width * b.getBounds().height;
                return bArea - aArea;
            })[0];

            return best;
        }
        return undefined;
    }
}


