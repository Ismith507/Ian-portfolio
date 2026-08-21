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

	return <canvas ref={ref} className="bg-bg aspect-square w-full" />;
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
	<kbd className="inline-flex min-w-[1.75rem] items-center justify-center border bg-surface px-2 py-0.5 font-mono text-xs text-text">
		{children}
	</kbd>
);

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

	const readout: [string, number][] = [
		['minReal', minReal],
		['maxReal', maxReal],
		['minImaginary', minImaginary],
		['size', size],
	];

	return (
		<div className="grid grid-cols-12 gap-6">
			<div className="col-span-12 md:col-span-7">
				<div className="border bg-surface p-3">
					<FractalCanvasControlled
						minReal={minReal}
						maxReal={maxReal}
						minImaginary={minImaginary}
						size={size}
					/>
				</div>
				<p className="mt-3 font-mono text-xs text-text-muted md:hidden">
					Keyboard required — best explored on desktop.
				</p>
			</div>

			<div className="col-span-12 flex flex-col gap-8 md:col-span-5">
				<div className="flex flex-col gap-3">
					<p className="font-mono text-xs uppercase tracking-widest text-text-muted">
						Controls
					</p>
					<div className="flex items-center gap-3">
						<span className="w-20 font-mono text-xs uppercase tracking-widest text-text-muted">
							Pan
						</span>
						<div className="flex flex-wrap gap-1.5">
							<Kbd>↑</Kbd>
							<Kbd>↓</Kbd>
							<Kbd>←</Kbd>
							<Kbd>→</Kbd>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="w-20 font-mono text-xs uppercase tracking-widest text-text-muted">
							Zoom in
						</span>
						<Kbd>SPACE</Kbd>
					</div>
					<div className="flex items-center gap-3">
						<span className="w-20 font-mono text-xs uppercase tracking-widest text-text-muted">
							Zoom out
						</span>
						<Kbd>SHIFT</Kbd>
					</div>
				</div>

				<table className="w-full border-collapse font-mono text-sm">
					<tbody>
						{readout.map(([key, value]) => (
							<tr key={key} className="border-b">
								<td className="py-1.5 pr-4 text-text-muted">{key}</td>
								<td className="break-all py-1.5 text-right text-text">
									{value}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<button
					type="button"
					className="self-start border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors duration-200 hover:bg-accent-fill hover:text-white"
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
