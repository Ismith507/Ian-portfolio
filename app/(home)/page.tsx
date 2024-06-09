import { LinkCard, LinkCardProps } from '@/components/link-card';
import Image from 'next/image';
import ianJpeg from '@/public/ian.jpeg';
import { FractalCanvas, } from '@/components/fractal-canvas';

const mainLinks = [
	{
		href: '/projects/fractals',
		title: 'Fractals',
		description: 'Shapes with math (and HTML Canvas)',
	},
] satisfies LinkCardProps[];

export default function Home() {
	return (
		
		<div className="background: bg-slate-700 flex flex-col items-center gap-24 p-24">
			<div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
				<div className="relative right-20 bottom-30 z-10 font-mono w-fit">
					<h1 className="text-xl">Hi, I&apos;m Ian Smith.</h1>

					<p className="my-5 text-sm">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.
					</p>
				</div>
				
				<Image
					className="relative left-70 dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
					src={ianJpeg}
					alt="Next.js Logo"
					placeholder="blur"
					width={170}
					height={213}
					priority
				/>
				
			</div>
			<h1 className="text-xl font-bold mt-24">My Work</h1>
			<div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
				{mainLinks.map((props) => (
					<LinkCard {...props} key={props.href} />
				))}
			</div>
		</div>
	);
}
