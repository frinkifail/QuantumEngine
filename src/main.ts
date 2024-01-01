import { Game, UIObject } from './lib'
import './style.css'

// name, element id, debug enabled
const coolgame = new Game("Cool Game", "app", true)

coolgame.logger.info('this is so cool!')

coolgame.scene.add('cool text', new UIObject(coolgame, "statictext", {staticText: "hello, world!", id: ""}))

coolgame.setGameVar('counter', 0)
coolgame.scene.add('cool display', new UIObject(coolgame, "display", {displayGameVar: "counter", id: ""}))

coolgame.subscribeLoop("counter loop", async () => {
    coolgame.increaseGameVar('counter', 1)
    await Game.sleep(200)
})
