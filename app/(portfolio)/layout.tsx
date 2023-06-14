import '../globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { type Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Portfolio | Ian Smith',
	description: '',
	viewport: 'width=device-width, initial-scale=1, user-scalable=no',
};

export default function Layout({ children }: { children: React.ReactNode }) {
	console.log('layout - portfolio');
	return (
		<html lang="en">
			<body className={inter.className}>
				<header className="sticky top-0 z-20 w-full p-4">
					<Link href="/" className="font-mono font-semibold">
						Ian Smith
					</Link>
				</header>
				<main>{children}</main>
			</body>
		</html>
	);
}
