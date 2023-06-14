'use client';

import { drawPorted } from '@/lib/mandelbrot/original-ported';
import { useHotkeys } from 'react-hotkeys-hook';
import {
	startTransition,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

export type FractalCanvasProps = {
	minReal?: number;
	maxReal?: number;
	minImaginary?: number;
	size?: number;
};

export const FractalCanvasControlled = (props: FractalCanvasProps) => {
	const { minReal = -2, maxReal = 1, minImaginary = -1.6, size = 480 } = props;

	const ref = useRef<HTMLCanvasElement>(null);

	const draw = useCallback(() => {
		startTransition(() => {
			if (!ref.current) return;
			drawPorted(ref.current, {
				minReal,
				maxReal,
				minImaginary,
				width: size,
				height: size,
			});
		});
	}, [ref, minReal, maxReal, minImaginary, size]);

	useEffect(() => {
		draw();
	}, [draw]);

	return <canvas ref={ref} className="bg-slate-400/50 aspect-square w-full" />;
};

export const FractalCanvas = () => {
	const [minReal, setMinReal] = useState(-2);
	const [maxReal, setMaxReal] = useState(1);
	const [minImaginary, setMinImaginary] = useState(-1.6);
	const [size, setSize] = useState(480);

	const panUp = useCallback(() => {
		setMinImaginary((prev) => prev + prev / 10);
	}, []);

	const panLeft = useCallback(() => {
		const nextMinReal = minReal - (maxReal - minReal) / 10;
		setMinReal(nextMinReal);
		setMaxReal(maxReal - (maxReal - nextMinReal) / 10);
	}, [minReal, maxReal]);

	const panDown = useCallback(() => {
		setMinImaginary((prev) => prev - prev / 10);
	}, []);

	const panRight = useCallback(() => {
		const nextMinReal = minReal + (maxReal - minReal) / 10;
		setMinReal(nextMinReal);
		setMaxReal(maxReal + (maxReal - nextMinReal) / 10);
	}, [minReal, maxReal]);

	const zoomIn = useCallback(() => {
		setMinReal((prev) => prev * 0.9);
		setMaxReal((prev) => prev * 0.9);
		setMinImaginary((prev) => prev * 0.9);
	}, []);

	const zoomOut = useCallback(() => {
		setMinReal((prev) => prev / 0.9);
		setMaxReal((prev) => prev / 0.9);
		setMinImaginary((prev) => prev / 0.9);
	}, []);

	useHotkeys('down', panUp);
	useHotkeys('left', panLeft);
	useHotkeys('up', panDown);
	useHotkeys('right', panRight);
	useHotkeys('space', zoomIn);
	useHotkeys('shift', zoomOut);

	return (
		<div className="grid grid-cols-12">
			<div className="col-span-12 md:col-span-6">
				<FractalCanvasControlled
					minReal={minReal}
					maxReal={maxReal}
					minImaginary={minImaginary}
					size={size}
				/>
			</div>
			<div className="p-4 w-full flex flex-col gap-4 col-span-12 md:col-span-6">
				<div className="w-full">
					<p>
						Pan with arrow keys, zoom in with spacebar, zoom out with shift.
					</p>
				</div>
				<table className="col-span-12">
					<tbody>
						<tr>
							<td>minReal</td>
							<td className="pl-8">{minReal}</td>
						</tr>
						<tr>
							<td>maxReal</td>
							<td className="pl-8">{maxReal}</td>
						</tr>
						<tr>
							<td>minImaginary</td>
							<td className="pl-8">{minImaginary}</td>
						</tr>
						<tr>
							<td>size</td>
							<td className="pl-8">{size}</td>
						</tr>
					</tbody>
				</table>
				<button
					className="text-red-600"
					onClick={() => {
						setMinReal(-2);
						setMaxReal(1);
						setMinImaginary(-1.6);
						setSize(480);
					}}
				>
					Reset
				</button>
			</div>
		</div>
	);
};
