import { LinkCard, LinkCardProps } from '@/components/link-card';

const mainLinks = [
	{
		href: '/pages/projects/fractals',
		title: 'Fractals',
		description: 'Shapes with math (and HTML Canvas)',
	},
	{
		href: '/projects/Chess',
		title: 'Chess',
		description: 'Chess engine written in C with chess bot'
	}
] satisfies LinkCardProps[];

export default function portfolio() {
    return (
        <div className="flex flex-col">
            <h1 className="flex flex-col items-center text-2xl text-white font-bold mt-12">My Work</h1>
            <div className="ml-32 flex flex-col text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                {mainLinks.map((props) => (
                    <LinkCard {...props} key={props.href} />
                    ))}
            </div>
        </div>
    );
}

