import '../globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="background: bg-slate-700">
                <main>
                    <nav>
                        <ul className="flex">
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/">Home</a>
                            </li>
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/pages/projects">My projects</a>
                            </li>
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/pages/artwork">Artwork</a>
                            </li>
                            {/*<li className="mr-6">
                                <a className="text-gray-400 cursor-not-allowed" href="#">contact</a>
                            </li>*/}
                        </ul>
                    </nav>
                    {children}
                </main>
            </body>
        </html>
    )
}