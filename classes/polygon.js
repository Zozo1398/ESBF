export default class Polygon {
    constructor(ctx) {
        this.ctx = ctx;
        this.points = [];
        this.isComplete = false;
        this.fillColor = null;
    }

    addPoint(point) {
        this.points.push(point);
        this.draw();
    }

    isNearFirstPoint(point, tolerance = 10) {
        if (this.points.length === 0) return false;
        const firstPoint = this.points[0];
        const dx = point.x - firstPoint.x;
        const dy = point.y - firstPoint.y;
        return Math.sqrt(dx * dx + dy * dy) < tolerance;
    }

    complete() {
        this.isComplete = true;
        this.draw();
    }

    setFillColor(color) {
        console.log('Setting fill color:', color);
        this.fillColor = color;
        this.draw();
    }

    isPointInside(x, y) {
        if (!this.isComplete || this.points.length < 3) return false;
        
        let inside = false;
        for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
            const xi = this.points[i].x, yi = this.points[i].y;
            const xj = this.points[j].x, yj = this.points[j].y;
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }

    draw() {
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        if (this.isComplete) {
            this.ctx.closePath();
            if (this.fillColor) {
                console.log('Filling polygon with color:', this.fillColor);
                this.ctx.fillStyle = this.fillColor;
                this.ctx.fill();
            }
        }

        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();

        // Dessiner les points
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'black';
            this.ctx.fill();
        });
    }

    isPointNear(x, y, tolerance = 10) {
        // Vérifier la proximité avec les sommets
        for (const point of this.points) {
            const dx = x - point.x;
            const dy = y - point.y;
            if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
                return true;
            }
        }

        // Vérifier la proximité avec les côtés
        for (let i = 0; i < this.points.length; i++) {
            const point1 = this.points[i];
            const point2 = this.points[(i + 1) % this.points.length];
            
            const A = point2.y - point1.y;
            const B = point1.x - point2.x;
            const C = point2.x * point1.y - point1.x * point2.y;
            
            const distance = Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);
            
            if (distance < tolerance) {
                const dotProduct = (x - point1.x) * (point2.x - point1.x) + 
                                 (y - point1.y) * (point2.y - point1.y);
                const squaredLength = Math.pow(point2.x - point1.x, 2) + 
                                    Math.pow(point2.y - point1.y, 2);
                
                if (dotProduct >= 0 && dotProduct <= squaredLength) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
