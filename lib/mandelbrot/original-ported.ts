export type Color = {
    r: number;
    g: number;
    b: number;
    alpha?: number;
}

export const drawPorted = (
	canvas: HTMLCanvasElement,
	options: {
        width: number;
        height: number;
		minReal: number;
		maxReal: number;
		minImaginary: number;
	}
) => {
    const { minReal, maxReal, minImaginary, width, height } = options;

	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext('2d');
	if (!context) throw new Error('Failed to get context');

	context.fillStyle = 'white';
	context.fillRect(0, 0, width, height);

	const setPixel = (x: number, y: number, { r, g, b }: Color) => {
		context.fillStyle = `rgb(${r},${g},${b})`;
		context.fillRect(x, y, 1, 1);
	};


	const maxImaginary = minImaginary + ((maxReal - minReal) * height) / width;
	const realFactor = (maxReal - minReal) / (width - 1);
	const ImaginaryFactor = (maxImaginary - minImaginary) / (height - 1);
	const maxIterations = 100;

	// Computing Mandelbrot set
	for (let y = 0; y < height - 1; y++) {
		const c_Imaginary = maxImaginary - y * ImaginaryFactor;
		for (let x = 0; x < width - 1; x++) {
			const c_Real = minReal + x * realFactor;

			let Z_Real = c_Real;
			let Z_Imaginary = c_Imaginary;
			let isInside = true;

			for (let n = 0; n < maxIterations - 1; n++) {
				const Z_RealSquared = Z_Real * Z_Real;
				const Z_ImaginarySquared = Z_Imaginary * Z_Imaginary;

				if (Z_RealSquared + Z_ImaginarySquared > 4) {
					isInside = false;
					if (n < maxIterations / 2 - 1) {
						setPixel(x, y, {
							r: (255 / (maxIterations / 2)) * n,
							g: 0,
							b: 0,
						});
					}
					if (n > maxIterations / 2 - 1) {
						setPixel(x, y, {
							r: 255,
							g: (255 / maxIterations) * (n - maxIterations / 2),
							b: (255 / maxIterations) * (n - maxIterations / 2),
						});
					}
					break;
				}

				Z_Imaginary = 2 * Z_Real * Z_Imaginary + c_Imaginary;
				Z_Real = Z_RealSquared - Z_ImaginarySquared + c_Real;
			}

			if (isInside) {
				setPixel(x, y, { r: 0, g: 0, b: 0 });
			}
		}
	}
};
