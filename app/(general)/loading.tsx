import { Audio } from 'react-loading-icons'

export default function loading() {
    return (
        <div className="flex flex-row justify-center items-center m-10 space-x-2">
            <p className="text-xl text-slate-600 mr-3">Loading</p>
            <span className="h-8 w-0.5 bg-slate-600 rounded-sm"></span>
            <Audio height="40" fill="#475569"/>
        </div>
    )
}