import * as path from "path";
import { Process, Setting } from "@nexus/nexus-module-builder"
import { BooleanSetting, StringSetting } from "@nexus/nexus-module-builder/settings/types";
import * as os from 'os'
import Monkey from "./monkey";

const MODULE_ID: string = "{EXPORTED_MODULE_ID}";
const MODULE_NAME: string = "{EXPORTED_MODULE_NAME}";
const HTML_PATH: string = path.join(__dirname, "../renderer/index.html");
const ICON_PATH: string = path.join(__dirname, "../assets/spotify-monkey.png")

export default class SpotifyMonkeyProcess extends Process {

    // oo oo
    private monkey: Monkey;

    private isShown: boolean = false;

    public constructor() {
        super({
            moduleID: MODULE_ID,
            moduleName: MODULE_NAME,
            paths: {
                htmlPath: HTML_PATH,
                iconPath: ICON_PATH
            }
        });
    }


    public initialize(): void {
        if (!this.isInitialized()) {
            console.info("🐒 Spotify Monkey is booted.");
        }

        super.initialize();

        const pathToExe: string = this.getSettings().findSetting("spotify_path").getValue() as string;
        const closeOnExit: boolean = this.getSettings().findSetting("close_on_exit").getValue() as boolean;

        this.monkey?.cleanup(); // cleanup any old 
        this.monkey = new Monkey(this, pathToExe, this.isShown, closeOnExit);
        this.sendToRenderer("path", pathToExe);
    }



    public onGUIShown(): void {
        this.isShown = true;

        if (this.monkey) {
            this.monkey.isShown = true;
            this.monkey.show();
        }

    }

    public onGUIHidden(): void {
        this.isShown = false;

        if (this.monkey) {
            this.monkey.isShown = false;
            this.monkey.hide();
        }
    }

    public async onExit(): Promise<void> {
        if (!(this.getSettings().findSetting("close_on_exit").getValue() as boolean)) {
            this.monkey.show();
        }
    }


    public registerSettings(): (Setting<unknown> | string)[] {
        return [
            new StringSetting(this)
                .setDefault((path.join(os.homedir(), "/AppData/Roaming/Spotify/Spotify.exe")).replace(/\\\\/g, '/'))
                .setName("Spotify Executable Path")
                .setDescription("The path to your Spotify executable file. Restart required.")
                .setAccessID('spotify_path')
                .setValidator(s => {
                    return (s as string).replace(/\\\\/g, '/')
                }),

            new BooleanSetting(this)
                .setName("Close Spotify on Exit")
                .setDefault(false)
                .setDescription("This will only work when Spotify is opened through Spotify Monkey. Restart required.")
                .setAccessID('close_on_exit')

        ];
    }


    public refreshSettings(modifiedSetting: Setting<unknown>): void {

    }

    public async handleEvent(eventName: string, data: any[]): Promise<any> {
        switch (eventName) {
            case "init": {
                this.initialize();
                break;
            }
            case "reboot": {
                this.initialize();
                break;
            }

            default: {
                console.warn(`Uncaught event: eventName: ${eventName} | data: ${data}`)
                break;
            }
        }
    }

}