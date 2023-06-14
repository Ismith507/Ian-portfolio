import { FractalCanvas, } from '@/components/fractal-canvas';

export default function Fractals() {
	return (
		<div className="w-full flex flex-col gap-4 p-8">
			Fractals
			<FractalCanvas />
		</div>
	);
}
