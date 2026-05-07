import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center shadow-xl shadow-slate-950/20">
    <h1 className="text-5xl font-semibold text-white">404</h1>
    <p className="mt-4 text-slate-400">Page not found.</p>
    <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white">
      Go back to dashboard
    </Link>
  </div>
);

export default NotFound;
