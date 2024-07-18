
export default function contact() {
    return(
        <div className="flex flex-col space-y-6 p-12 mx-64">
            <h1 className="text-xl font-bold">Contact me!</h1>
            <p className="text-gray-600">
                Business Inquiries? Employment offers? Have any questions?<br></br>
                Let me Know by filling out the contact sheet below.
            </p>
            <form className="text-sm space-y-6">
                <div>
                    <label htmlFor="name" className="block mb-2">Name: </label>
                    <input type="text" id="name" className="bg-gray-200 border rounded-sm focus focus:border-none"></input>
                </div>
                <div>
                    <label htmlFor="email" className="block mb-2">Your email: </label>
                    <input type="email" id="email" className="bg-gray-200 border rounded-sm focus focus:border-none"></input>
                </div>
                <div>
                    <label htmlFor="message" className="block mb-2">Message: </label>
                    <textarea id="message" name="message" rows={6} cols={100} className="bg-gray-200 border rounded-sm focus focus:border-none"></textarea>
                </div>
                <button type="submit" className="text-white text-lg bg-slate-600 h-10 w-20 rounded-sm">Submit</button>
            </form>
        </div>
    )
}