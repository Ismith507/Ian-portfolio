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
        <div>
            <h1 className="flex flex-col items-center text-xl text-white font-bold mt-12">My Work</h1>
                <div className="mb-32 mr-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                    {mainLinks.map((props) => (
                        <LinkCard {...props} key={props.href} />
                    ))}
                </div>
        </div>
    );
}

