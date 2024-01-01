import { Game, UIObject } from './lib'
// import './style.css'

// name, element id, debug enabled
// const coolgame = new Game("Cool Game", "app", true)

// coolgame.logger.info('this is so cool!')

// coolgame.scene.add('cool text', new UIObject(coolgame, "statictext", {staticText: "hello, world!", id: ""}))

// coolgame.setGameVar('counter', 0)
// coolgame.scene.add('cool display', new UIObject(coolgame, "display", {displayGameVar: "counter", id: ""}))

// coolgame.subscribeLoop("counter loop", async () => {
//     coolgame.increaseGameVar('counter', 1)
//     await Game.sleep(200)
// })
const pi = new Game("Particle Incremental", "app", true)
pi.setGameVar('num', 0)

pi.scene.add("wip", new UIObject(pi, "statictext", {staticText: "WORK IN PROGRESS"}))
pi.scene.add("genertor", new UIObject(pi, "button", {staticText: "genertor"}))
pi.scene.add("num display", new UIObject(pi, "display", {displayGameVar: "num"}))


// pi.scene.add("particle display", new UIObject(pi, "display", {displayGameVar: "num", id: ""}))

// pi.scene.add("bg1", new UIObject(pi, "button", {buttonCallback: () => {
//     pi.subscribeLoop('genloop', async () => {
//         pi.increaseGameVar("num", 1)
//         await Game.sleep(1000)
//     })
// }, id: "", staticText: "buy generator 1"}))
