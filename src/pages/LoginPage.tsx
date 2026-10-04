import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-sm font-bold">CM</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Co.Muneeb</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your Kirana Business, Clearly.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-sm font-semibold text-amber-800">Demo Mode Active</p>
          <p className="text-xs text-amber-600 mt-0.5">No login required. All data is stored in your browser.</p>
        </div>

        <Link
          to="/dashboard"
          className="w-full block bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-center hover:bg-indigo-700 transition-colors"
        >
          Enter Dashboard
        </Link>

        <p className="text-xs text-center text-gray-400 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
