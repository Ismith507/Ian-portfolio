import '../globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="background: bg-slate-700 ">
                <main>
                    <nav className="flex flex-row justify-center m-10 text-xl">
                        <ul className="flex">
                            <li className="mx-6">
                                <a className="text-white border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="/">Home</a>
                            </li>
                            <li className="mx-6">
                                <a className="text-white border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="/pages/projects">My projects</a>
                            </li>
                            <li className="mx-6">
                                <a className="text-white border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="/pages/artwork">Artwork</a>
                            </li>
                            <li className="mx-6">
                                <a className="text-white border-transparent border-8 hover:bg-slate-600 hover:rounded-lg hover:border-slate-600 hover:border-8" href="#">contact</a>
                            </li>
                        </ul>
                    </nav>
                    <hr className='m-10 after:h-10'/>
                    {children}
                </main>
            </body>
        </html>
    )
}