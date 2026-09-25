import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WebsiteForm from '../components/websites/WebsiteForm';
import websiteService from '../services/websiteService';
import { useToast } from '../context/ToastContext';

function AddWebsitePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const newSite = await websiteService.create(data);
      showToast(`Website "${data.website_name}" added successfully!`);
      navigate(`/websites/${newSite.id || ''}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add website. Please verify your fields.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/websites"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Websites
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Website</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Register a client website into WebWatch 360 to track automatic expiry and renewals.
        </p>
      </div>

      <div className="card">
        <WebsiteForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Register Website" />
      </div>
    </div>
  );
}

export default AddWebsitePage;