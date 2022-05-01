class Frog {
    constructor(x, y, width, height, controlType) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.speed = 0
        this.speed_x = 0
        this.acceleration = 0.1
        this.acceleration_x = 0.1
        this.maxMovement = 0.2
        this.friction = 0.05
        this.angle = 0

        this.hit = false

        this.useBrain = controlType == "AI"

        if (controlType != "TRAFFIC") {
            this.sensor = new Sensor(this)
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            )
        }

        this.controls = new Controls(controlType)
    }

    update(traffic) {
        if (!this.hit) {
            this.#move()
            this.polygon = this.#createPolygon()
            this.hit = this.#assessHit(traffic)
        }

        if (this.sensor) {
            this.sensor.update(traffic)
            const offsets = this.sensor.vision.map(
                s=>s == null ? 0 : 1-s.offsets
            )

            const outputs = NeuralNetwork.feedForward(offsets, this.brain)

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        }

        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed
        }

        if (this.speed > 0) {
            this.speed -= this.friction
        }

        if (this.speed < 0) {
            this.speed += this.friction
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }

        if (this.speed == 0) {
            if (this.controls.left) {
                this.speed_x += this.acceleration_x
            }

            if (this.controls.right) {
                this.speed_x -= this.acceleration_x
            }

            if (this.speed_x > this.maxSpeed) {
                this.speed_x = this.maxSpeed
            }

            if (this.speed_x < -this.maxSpeed) {
                this.speed_x = -this.maxSpeed
            }

            if (this.speed_x < 0) {
                this.speed_x += this.friction
            }

            if (this.speed_x > 0) {
                this.speed_x -= this.friction
            }

            if (Math.abs(this.speed_x) < this.friction) {
                this.speed_x = 0
            }

            this.x -= this.speed_x
        }

        this.y -= this.speed
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points;
    }

    #assessHit(traffic) {
        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon, traffic[i].polygon)) {
                return true
            }
        }

        return false
    }

    draw(ctx, color, drawSensor = false) {
        if (this.hit) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}