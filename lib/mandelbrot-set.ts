export type Vector = {
	x: number;
	y: number;
};

export type Color = {
	r: number;
	g: number;
	b: number;
	alpha?: number;
};

function square(x: number) {
	return x * x;
}

export type MandelbrotConfig = {
	palette: Color[];
	pan: Vector;
	offset: Vector;
	zoom: number;
	maxIterations: number;
};

export class MandelbrotSet {
	constructor(private config: MandelbrotConfig) {}

	private getColor(position: Vector) {
		const { palette, offset, pan, zoom, maxIterations } = this.config;

		const fractal: Vector = {
			x: (position.x + offset.x + pan.x) / zoom,
			y: (position.y + offset.y + pan.y) / zoom,
		};

		let realPart = 0;
		let imaginaryPart = 0;

		let iterations = 0;
		while (iterations < maxIterations) {
			iterations++;

			const realNext = square(realPart) - square(imaginaryPart) + fractal.x;
			const imaginaryNext = 2 * realPart * imaginaryPart + fractal.y;

			realPart = realNext;
			imaginaryPart = imaginaryNext;

			if (square(realPart) + square(imaginaryPart) > 4) break;
		}

		console.log(iterations);

		if (iterations === maxIterations) return { r: 0, g: 0, b: 0 };
		return palette[Math.floor((iterations / (maxIterations - 1)) * 255)];
	}

	async draw(canvas: HTMLCanvasElement) {
		const context = canvas.getContext('2d');
		if (!context) return;
		const { width, height } = canvas;
		const imageData = context.createImageData(width, height);
		let px = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (++px % 100 === 0) {
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
				const color = this.getColor({ x, y });
				const pixelIdx = (y * width + x) * 4;
				imageData.data[pixelIdx] = color.r;
				imageData.data[pixelIdx + 1] = color.g;
				imageData.data[pixelIdx + 2] = color.b;
				imageData.data[pixelIdx + 3] = 255;
			}
		}
		console.log(imageData.width, imageData.height);
		context.putImageData(imageData, 0, 0);
	}
}
