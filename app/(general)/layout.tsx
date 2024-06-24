import '../globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="background: bg-white ">
                <main>
                    <nav className="flex flex-row justify-center place-items-center text-xl background: bg-slate-600 sticky top-0 w-full z-30 h-16">
                        <ul className="flex text-white">
                            <li className="mx-6 hover:-translate-y-1 transition ease-in-out duration-200 hover:bg-gradient-to-b hover:from-white hover:to-orange-400 hover:inline-block hover:text-transparent hover:bg-clip-text">
                                <a href="/">Home</a>
                            </li>
                            <li className="mx-6 hover:-translate-y-1 transition ease-in-out duration-200 hover:bg-gradient-to-b hover:from-white hover:to-orange-400 hover:inline-block hover:text-transparent hover:bg-clip-text">
                                <a href="/pages/projects">My projects</a>
                            </li>
                            <li className="mx-6 hover:-translate-y-1 transition ease-in-out duration-200 hover:bg-gradient-to-b hover:from-white hover:to-orange-400 hover:inline-block hover:text-transparent hover:bg-clip-text">
                                <a href="/pages/artwork">Artwork</a>
                            </li>
                            <li className="mx-6 hover:-translate-y-1 transition ease-in-out duration-200 hover:bg-gradient-to-b hover:from-white hover:to-orange-400 hover:inline-block hover:text-transparent hover:bg-clip-text">
                                <a href="/pages/contact">contact</a>
                            </li>
                        </ul>
                    </nav>
                    {children}
                    <footer className="flex flex-col justify-center bg-slate-600 text-white">
                        <nav className="flex flex-row justify-center m-10 text-sm">
                            <ul className="flex">
                                <li className="mx-6">
                                    <a className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="#">Home</a>
                                </li>
                                <li className="mx-6">
                                    <p>|</p>
                                </li>
                                <li className="mx-6">
                                    <a className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="/pages/projects">My projects</a>
                                </li>
                                <li className="mx-6">
                                    <p>|</p>
                                </li>
                                <li className="mx-6">
                                    <a className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="/pages/artwork">Artwork</a>
                                </li>
                                <li className="mx-6">
                                    <p>|</p>
                                </li>
                                <li className="mx-6">
                                    <a className="border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="#">contact</a>
                                </li>
                            </ul>
                        </nav>
                        <ul className="flex flex-row justify-center space-x-4 mb-12">
                            <li>
                                <p>331-575-7529</p>
                            </li>
                            <li>
                                <p>|</p>
                            </li>
                            <li>
                                <p>ixsmithx1999@gmail.com</p>
                            </li>
                            <li>
                                <p>|</p>
                            </li>
                            <li>
                                <a href='https://github.com/Ismith507'>github.com/Ismith507</a>
                            </li>
                        </ul>
                        
                    </footer>
                </main>
            </body>
        </html>
    )
}