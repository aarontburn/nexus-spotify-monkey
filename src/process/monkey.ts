import { spawn } from "child_process";
import { BaseWindow, WebContentsView, Rectangle } from "electron";
import { Window, windowManager } from "node-window-manager";



export default class Monkey {
    private nexusWindow: Window;
    private pathToExe: string;

    public isShown: boolean;
    public appWindow: Window;


    public constructor(pathToExe: string, isShown: boolean, closeOnExit: boolean) {
        this.pathToExe = pathToExe;
        this.isShown = isShown;

        this.nexusWindow = windowManager.getWindows().find(win => win.getTitle() === "Nexus");
        const existingWindow: Window = this.findBestWindow();
        if (existingWindow === undefined) {
            spawn(this.pathToExe, [], {
                detached: !closeOnExit
            });
            this.waitForRealWindow().then((appWindow: Window) => {
                this.attachHandlersToWindow(appWindow);
            }).catch(err => {
                console.error(err);
            });
        } else {
            this.attachHandlersToWindow(existingWindow);
        }
    }

    private waitForRealWindow(timeout = 10000, interval = 200): Promise<Window> {
        return new Promise((resolve, reject) => {
            const startMS: number = Date.now();

            const check = () => {
                const best: Window | undefined = this.findBestWindow();
                if (best !== undefined) {
                    return resolve(best);
                }

                if (Date.now() - startMS >= timeout) {
                    return reject(new Error('Window not found within timeout'));
                }

                setTimeout(check, interval);
            };

            check();
        });
    }


    private attachHandlersToWindow(appWindow: Window) {
        this.appWindow = appWindow;

        appWindow.restore();
        if (!this.isShown) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.bringToTop();
        }

        appWindow.setOwner(this.nexusWindow);

        this.resize(appWindow);

        BaseWindow.getAllWindows()[0].contentView.children[0].on('bounds-changed', () => {
            this.resize(appWindow);
        })
        BaseWindow.getAllWindows()[0].on('resize', () => {
            this.resize(appWindow);
        })
        BaseWindow.getAllWindows()[0].on('move', () => {
            this.resize(appWindow);
        })
    }


    private resize(appWindow: Window) {
        const windowZoom = (BaseWindow.getAllWindows()[0].contentView.children[0] as WebContentsView).webContents.zoomFactor;
        const windowContentBounds: Rectangle = BaseWindow.getAllWindows()[0].getContentBounds();

        appWindow.setBounds({
            x: windowContentBounds.x + (70 * windowZoom),
            y: windowContentBounds.y,
            width: windowContentBounds.width - (70 * windowZoom),
            height: windowContentBounds.height,
        });
    }

    private findBestWindow(): Window | undefined {
        const candidates: Window[] = windowManager.getWindows().filter(w =>
            w.path.toLowerCase() === this.pathToExe.replace(/\//g, "\\").toLowerCase() &&
            w.isVisible()
        );

        if (candidates.length > 0) {
            const best: Window = candidates.sort((a, b) => {
                const aArea = a.getBounds().width * a.getBounds().height;
                const bArea = b.getBounds().width * b.getBounds().height;
                return bArea - aArea;
            })[0];

            return best;
        }
        return undefined;
    }
}


