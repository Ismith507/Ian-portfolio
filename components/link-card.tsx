import Link from 'next/link';

export type LinkCardProps = {
	href: string;
	title: string;
	description: string;
};

export const LinkCard = ({ href, title, description }: LinkCardProps) => {
	return (
		<Link
			href={href}
			className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:bg-slate-500 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
		>
			<h2 className={`mb-3 text-2xl text-white font-semibold`}>
				{title}{' '}
				<span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
					-&gt;
				</span>
			</h2>
			<p className={`m-0 max-w-[30ch] text-sm text-white opacity-50`}>{description}</p>
		</Link>
	);
};
