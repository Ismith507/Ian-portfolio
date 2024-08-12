import Link from 'next/link';
import Image from 'next/image';

export type LinkCardProps = {
	href: string;
	title: string;
	description: string;
	thumbnail: string;
};

export const LinkCard = ({ href, title, description, thumbnail }: LinkCardProps) => {
	return (
		<Link
			href={href}
			className="group rounded-lg border border-transparent px-5 py-4 bg-slate-600 transition-colors hover:bg-slate-800 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
		>
			<div className='flex flex-row space-x-24 justify-between'>
				<div className="flex flex-col">
					<h2 className={`mb-3 text-2xl text-white font-semibold`}>
						{title}{' '}
						<span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
							-&gt;
						</span>
					</h2>
					<p className={`m-0 max-w-[30ch] text-sm text-white opacity-50`}>{description}</p>
				</div>
				<span>
					<Image
						className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] rounded-lg"
						src={thumbnail}
						alt="Next.js Logo"
						width={170}
						height={213}
						priority
					/>
				</span>
			</div>
			
		</Link>
	);
};
