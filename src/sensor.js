class Sensor {
    constructor(frog) {
        this.frog = frog

        this.rayCount = 20
        this.rayLength = 150
        this.raySpread = Math.PI * 2

        this.rays = []
        this.vision = []
    }

    update(traffic) {
        this.#castRays()

        this.vision = []
        for(let i = 0; i < this.rays.length; i++) {
            this.vision.push(
                this.#getVision(this.rays[i],
                    traffic)
            )
        }
    }

    #getVision(ray, traffic) {
        let intersection = []

        for(let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;

            for(let j = 0; j < poly.length; j++) {
                const value = getIntersection (
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                )

                if(value) {
                    intersection.push(value)
                }
            }
        }

        if(intersection.length == 0) {
            return null
        } else {
            const offsets = intersection.map(e=>e.offset)
            const minOffsets = Math.min(...offsets)
            return intersection.find(e=>e.offset == minOffsets)
        }
    }

    #castRays() {
        this.rays=[];
        
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread / 2,
                this.raySpread,
                i / (this.rayCount - 1)
            );

            const start = {x:this.frog.x, y:this.frog.y};
            const end = {
                x:this.frog.x-
                    Math.sin(rayAngle) * this.rayLength,
                y:this.frog.y-
                    Math.cos(rayAngle) * this.rayLength
            };

            this.rays.push([start,end]);
        }
    }

    draw(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.vision[i]){
                end=this.vision[i];
            }

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    } 
}