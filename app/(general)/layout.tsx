import '../globals.css';
import Link from 'next/link';
import { Audio } from 'react-loading-icons'

const NavLink = ({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) => {
	return (
		<li className="group mx-6">
			<Link className="py-1" href={href}>
				<span className="transition duration-200 ease-in-out group-hover:-translate-y-2 group-hover:inline-block">
					{children}
				</span>
			</Link>
		</li>
	);
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<main>
					<nav className="flex flex-row justify-center place-items-center text-xl background: bg-slate-600 sticky top-0 w-full z-30 h-16">
						<ul className="flex text-white">
							<NavLink href="/">Home</NavLink>
							<NavLink href="/projects">My projects</NavLink>
							<NavLink href="/artwork">Artwork</NavLink>
							<NavLink href="/contact">Contact</NavLink>
						</ul>
					</nav>
					{children}
					<footer className="flex flex-col justify-center bg-slate-600 text-white absolute bottom-0 left-0 w-screen">
						<nav className="flex flex-row justify-center m-10 text-sm">
							<ul className="flex">
								<li className="mx-6">
									<Link
										className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8"
										href="/"
									>
										Home
									</Link>
								</li>
								<li className="mx-6">
									<p>|</p>
								</li>
								<li className="mx-6">
									<Link
										className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8"
										href="/projects"
									>
										My Projects
									</Link>
								</li>
								<li className="mx-6">
									<p>|</p>
								</li>
								<li className="mx-6">
									<Link
										className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8"
										href="/artwork"
									>
										Artwork
									</Link>
								</li>
								<li className="mx-6">
									<p>|</p>
								</li>
								<li className="mx-6">
									<Link
										className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8"
										href="/contact"
									>
										Contact
									</Link>
								</li>
							</ul>
						</nav>
						<ul className="flex flex-row justify-center space-x-4 mb-12">
							<li>
								<Link href="https://github.com/Ismith507">github.com/Ismith507</Link>
							</li>
						</ul>
					</footer>
				</main>
			</body>
		</html>
	);
}
