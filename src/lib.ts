type ObjectTypes = "display" | "statictext" | "button" | "upgrade" | "debug" | "custom"
type SubscriptionCaller = (newvalue: any, oldvalue: any) => void
type AnyNumber = number | Number | BigInt | bigint;
type AsyncVoidFunction = () => Promise<void>

const ticksPerSecond = 20

interface ObjectProperties {
	displayGameVar?: string,
	staticText?: string,
	buttonCallback?: VoidFunction,
	upgradeCallback?: VoidFunction,
	debugCallback?: VoidFunction,
	customElement?: HTMLElement,
	id?: string,
	forceGameVar?: boolean,
	classes?: Array<string>,
}

export class UIObject {
	htmlElement: HTMLElement
	constructor(root: Game, objtype: ObjectTypes, properties: ObjectProperties) {
		if (properties.displayGameVar == undefined && properties.staticText == undefined) {
			throw new Error("static text not found");
		}
		this.htmlElement = document.createElement('i')
		this.htmlElement.textContent = 'not found'
		switch (objtype) {
			case "button":
				this.htmlElement = document.createElement('button');
				this.htmlElement.textContent = <string>properties.staticText
				if (properties.buttonCallback == undefined) {
					// throw new Error("button callback not found")
					root.logger.warn('no button callback')
					properties.buttonCallback = () => {}
				}
				this.htmlElement.onclick = properties.buttonCallback
				break;
			case 'display':
				if (properties.displayGameVar == undefined) {
					throw new Error("display with no game variable")
				} else if (
					!(root.gameVars.has(properties.displayGameVar))
					&& (
						properties.forceGameVar === undefined
						|| properties.forceGameVar === false
					)
				) {
					throw new Error("game variable not found; to continue anyway, use the forceGameVar property")
				}
				this.htmlElement = document.createElement('p')
				this.htmlElement.textContent = root.getGameVar(properties.displayGameVar)
				root.subscribe(properties.displayGameVar, (nv) => {
					this.htmlElement.textContent = nv
				})
				break;
			case 'statictext':
				if (properties.staticText == undefined) {
					root.logger.warn("no text, setting to empty string")
					properties.staticText = ""
				}
				this.htmlElement = document.createElement('p')
				this.htmlElement.textContent = properties.staticText
				break;
			case 'upgrade':
				root.logger.warn("this isnt finished yet")
				break;
			case 'debug':
				if (!root.debugEnabled) {
					break;
				}
				if (properties.debugCallback == undefined) {
					throw new Error('no debug callback')
				}
				this.htmlElement = document.createElement('button');
				this.htmlElement.textContent = <string>properties.staticText
				this.htmlElement.onclick = properties.debugCallback
				break;
			case 'custom':
				if (properties.customElement == undefined) {
					throw new Error("custom element not defined")
				}
				this.htmlElement = properties.customElement;
				break;
			default:
				throw new Error("invalid object type")
		}
		if (properties.id) this.htmlElement.id = properties.id;
		if (properties.classes != undefined) {
			properties.classes.forEach((v) => {
				this.htmlElement.classList.add(v)
			})
		}
	}

}

class Scene {
	#objects: Map<string, UIObject> = new Map();
	app: HTMLDivElement
	constructor(app: HTMLDivElement) {
		this.app = app
	}
	add(id: string, obj: UIObject) {
		this.#objects.set(id, obj);
		this.app.append(obj.htmlElement)
	}
	remove(id: string) {
		const obj = this.#objects.get(id);
		if (obj === undefined) {throw new Error(`${id} not found in scene`)}
		obj.htmlElement.remove();
		this.#objects.delete(id);
	}
}

export class Game {
	name: string;
	#subscriptions: Map<string, SubscriptionCaller> = new Map();
	gameVars: Map<string, any> = new Map();
	scene: Scene;
	debugEnabled: boolean;
	#loops: Map<string, AsyncVoidFunction> = new Map();
	constructor(name: string, appId: string, debugEnabled: boolean) {
		const app = <HTMLDivElement | null>document.getElementById(appId);
		if (app == null) {
			throw new Error(`Element ${appId} not found while trying to initialize ${name}`)
		}
		this.name = name;
		this.scene = new Scene(app);
		this.debugEnabled = debugEnabled
		// this.loop = setInterval(async () => {
		// 	for (const loop of this.#loops) {
		// 		await loop[1]()
		// 	}
		// }, 1/ticksPerSecond)
		const loops = this.#loops
		const sleep = Game.sleep
		async function _() {
			for (const loop of loops) {
				await loop[1]()
			}
			await sleep(1/ticksPerSecond)
			await _()
		}
		_()
	}
	get logger() {
		const name = this.name;
		return {
			info(msg: any) { console.info(`[${name}] ${msg.toString()}`) },
			warn(msg: any) { console.warn(`[${name}] ${msg.toString()}`) },
			error(msg: any) { console.error(`[${name}] ${msg.toString()}`) },
			fatal(msg: any) { throw new Error(`[${name}] ${msg.toString()}`) }
		}
	}
	subscribe(id: string, fn: SubscriptionCaller) {
		this.#subscriptions.set(id, fn)
	}
	unsubscribe(id: string) {
		this.#subscriptions.delete(id)
	}
	setGameVar(id: string, value: any) {
		this.#subscriptions.forEach((v, k) => {
			if (k === id) v(value, this.getGameVar(id))
		})
		this.gameVars.set(id, value)
	}
	increaseGameVar(id: string, value: AnyNumber) {
		this.setGameVar(id, this.gameVars.get(id) + value);
	}
	decreaseGameVar(id: string, value: AnyNumber) {
		this.increaseGameVar(id, -value)
	}
	getGameVar(id: string) {
		return this.gameVars.get(id)
	}
	subscribeLoop(id: string, fn: AsyncVoidFunction) {
		this.#loops.set(id, fn)
	}
	unsubscribeLoop(id: string) {
		this.#loops.delete(id)
	}
	static sleep (ms: number) { return new Promise((r) => setTimeout(r, ms)) }
}
