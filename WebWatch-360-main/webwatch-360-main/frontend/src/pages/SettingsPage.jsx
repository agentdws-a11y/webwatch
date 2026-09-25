import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import { Settings, Shield, User, Lock, Key, CheckCircle } from 'lucide-react';

function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changePassword(currentPassword, newPassword);
      showToast('Admin password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update password. Verify current password.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your single-user admin authentication, security credentials, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold border-b border-slate-100 pb-3">
            <User size={18} />
            <span>Admin Profile</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px]">Administrator Name</span>
              <span className="font-bold text-slate-900 text-sm">{user?.name || 'Developer Admin'}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="font-medium text-slate-900">{user?.email || 'admin@webwatch360.com'}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-400 block text-[11px]">Access Role</span>
              <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                Solo Master Admin
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 card space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold border-b border-slate-100 pb-3">
            <Lock size={18} />
            <span>Change Master Password</span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs py-2 px-5 font-semibold"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
