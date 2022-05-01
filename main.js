const myCanvas = document.getElementById("myCanvas")
myCanvas.width = 400
const networkCanvas = document.getElementById("networkCanvas")
networkCanvas.width = 400

const ctx = myCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const numLanes = 7

const road = new Road(myCanvas.width / 2, myCanvas.width * 0.80, numLanes)

const N = 200
const Z = 30

const froggies = generateFrogs(N)
const traffic = generateTraffic(Z)

let bestFrog = froggies[0]

if(localStorage.getItem("bestFroggy")) {
    for (let i = 0; i < froggies.length; i++) {
        froggies[i].brain = JSON.parse(
            localStorage.getItem("bestFroggy")
        )

        if(i != 0) {
            NeuralNetwork.mutate(froggies[i].brain, 0.2)
        }
    }
}

animate()

function save() {
    localStorage.setItem("bestFroggy", JSON.stringify(bestFrog.brain))
}

function discard() {
    localStorage.removeItem("bestFroggy")
}

function generateFrogs(N) {
    const frogs = []

    for(let i = 0; i < N; i++) {
        frogs.push(new Frog(20, 200, 30, 30, "AI"))
    }

    return frogs
}

function generateTraffic(Z) {
    const traffic = []

    for(let i = 0; i < Z; i++) {
        let rlane = Math.floor(Math.random() * numLanes) + 1
        let dir = Math.random() < 0.5;
        let pos = Math.floor(Math.random() * (0 - myCanvas.height + 1) + 0)
        let size = Math.floor(Math.random() * (60 - 20 + 1) + 20)

        traffic.push(new Frog(
            road.getLaneCenter(rlane),
            pos,
            30,
            size,
            "TRAFFIC" 
        ))
    }

    return traffic

}

function animate(time) {

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update([])
    }

    for (let i = 0; i < froggies.length; i++) {
        froggies[i].update(traffic)
    }

    bestFrog = froggies.find(
        c=>c.x==Math.max(
            ...froggies.map(c=>c.x)
        )
    )

    myCanvas.height = window.innerHeight
    networkCanvas.height = window.innerHeight

    ctx.save()

    road.draw(ctx)

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx, "black", false)
    }

    for (let i = 0; i < froggies.length; i++) {
        froggies[i].draw(ctx, "green")
    }

    bestFrog.draw(ctx, "green", true)

    ctx.restore()

    networkCtx.lineDashOffset = -time / 50
    Visualizer.drawNetwork(networkCtx, bestFrog.brain)

    generateTraffic(Z)

    requestAnimationFrame(animate)
}