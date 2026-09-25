import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        The route or resource you are looking for does not exist in WebWatch 360.
      </p>
      <Link to="/dashboard" className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mt-2">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
