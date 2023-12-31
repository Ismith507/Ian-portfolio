import { LinkCard, LinkCardProps } from '@/components/link-card';
import Image from 'next/image';
import ianJpeg from '@/public/ian.jpeg';

const mainLinks = [
	{
		href: '/projects/fractals',
		title: 'Fractals',
		description: 'Shapes with math (and HTML Canvas)',
	},
] satisfies LinkCardProps[];

export default function Home() {
	return (
		<div className="flex flex-col items-center gap-24 p-24">
			<div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
				<Image
					className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
					src={ianJpeg}
					alt="Next.js Logo"
					placeholder="blur"
					width={170}
					height={213}
					priority
				/>
				<div className="absolute left-32 top-44 z-10 font-mono text-sm w-fit">
					<p className="border-gray-300 whitespace-nowrap bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl border bg-gray-200 p-4 dark:bg-zinc-800/30">
						Hi, I&apos;m Ian Smith.
					</p>
				</div>
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
