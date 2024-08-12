import { LinkCard, LinkCardProps } from '@/components/link-card';

const mainLinks = [
	{
		href: '/projects/fractals',
		title: 'Fractals',
		description: 'Shapes with math (and HTML Canvas)',
        thumbnail: '/Mandelbrot.jpeg'
	},
	{
		href: 'https://github.com/Ismith507/Chess.git',
		title: 'Chess',
		description: 'Chess engine written in C++',
        thumbnail: '/knight.jpg'
	},
] satisfies LinkCardProps[];

export default function portfolio() {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl text-slate-700 font-bold py-6">My Work</h1>
            <div className="flex flex-col text-left gap-12 pb-12 pt-6 lg:mb-0 lg:grid-cols-4 lg:text-left">
                {mainLinks.map((props) => (
                    <LinkCard {...props} key={props.href} />
                    ))}
            </div>
        </div>
    );
}

