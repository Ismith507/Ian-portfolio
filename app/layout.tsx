export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <main>
                    <nav>
                        <ul className="flex">
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/(home)">Home</a>
                            </li>
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/(portfolio)">My projects</a>
                            </li>
                            <li className="mr-6">
                                <a className="text-white hover:text-blue-800" href="/(artwork)">artwork</a>
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