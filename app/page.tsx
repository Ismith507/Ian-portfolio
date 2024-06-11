import Image from 'next/image';
import ianJpeg from '@/public/ian.jpeg';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Ian Payntar Smith',
	description: '',
};

export default function Home() {
	return (	
		<div className="flex flex-col items-center gap-24 p-24 text-white">
			<div className="relative flex place-items-center">
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
		</div>
	);
}
