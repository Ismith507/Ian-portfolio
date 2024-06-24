import Image from 'next/image';
import ianJpeg from '@/public/ian.jpeg';
import '../globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Ian Payntar Smith',
	description: '',
};

export default function Home() {
	return (	
		<div className="flex flex-col items-center gap-0 py-24 px-72 text-black">
			<div className="flex flex-row">
				<div className="relative z-10 font-mono w-fit">
					<h1 className="text-xl mx-2">Hi, I&apos;m Ian Smith.</h1>

					<p className="text-sm my-10 mx-2">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.<br/><br/>

						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.<br/><br/>

						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.<br/><br/>

						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.<br/><br/>

						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
						irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
						pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
						deserunt mollit anim id est laborum.
					</p>
				</div>
				
				<div className="block m-10">
					<Image
						className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] rounded-lg"
						src={ianJpeg}
						alt="Next.js Logo"
						placeholder="blur"
						width={170}
						height={213}
						priority
					/>
				</div>
			</div>
		</div>
	);
}
