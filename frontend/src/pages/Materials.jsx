import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CommentSection from '../components/CommentSection.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { ReportDialog } from '../components/ReportDialog.jsx';
import MaterialHeader from '../components/material/MaterialHeader.jsx';
import MaterialPreview from '../components/material/MaterialPreview.jsx';
import MaterialSidebar from '../components/material/MaterialSidebar.jsx';
import { showError } from '../utils/format.js';

export function Field({ label, hint, required, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="ml-0.5 text-rose-300">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function MaterialDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [upvoteBusy, setUpvoteBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/materials/${id}`);
      setMaterial(data.data.material);
    } catch (error) {
      toast.error(showError(error, 'Material not found.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function download() {
    try {
      const { data } = await api.patch(`/materials/${id}/download`);
      window.open(data.data.fileUrl, '_blank', 'noopener,noreferrer');
      await load();
    } catch (error) {
      toast.error(showError(error, 'Could not download material.'));
    }
  }

  async function upvote() {
    if (!user) {
      toast.error('Sign in to upvote.');
      return;
    }
    setUpvoteBusy(true);
    try {
      await api.patch(`/materials/${id}/upvote`);
      await load();
    } catch (error) {
      toast.error(showError(error, 'Could not update upvote.'));
    } finally {
      setUpvoteBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      await api.patch(`/materials/${id}/verify`);
      toast.success('Material verified.');
      await load();
    } catch (error) {
      toast.error(showError(error, 'Could not verify material.'));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    try {
      await api.delete(`/materials/${id}`);
      setConfirmDelete(false);
      toast.success('Material deleted.');
      navigate('/subjects');
    } catch (error) {
      toast.error(showError(error, 'Could not delete material.'));
    }
  }

  async function submitReport(reason) {
    setReportBusy(true);
    try {
      await api.patch(`/materials/${id}/flag`, { reason });
      setReportOpen(false);
      toast.success('Report submitted.');
    } catch (error) {
      toast.error(showError(error, 'Could not report material.'));
    } finally {
      setReportBusy(false);
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />;

  if (!material) {
    return (
      <div className="surface p-8 text-center">
        <p className="text-slate-300">This material is unavailable.</p>
        <Link to="/subjects" className="button-secondary mt-4">
          Browse subjects
        </Link>
      </div>
    );
  }

  const uploader = material.uploaderId || {};
  const owns = user && String(user._id) === String(uploader._id);
  const voted =
    user &&
    material.upvotedBy?.some((voterId) => String(voterId) === String(user._id));

  const canVerify =
    (user?.role === 'professor' || user?.role === 'admin') &&
    !material.verifiedByAuthority;
  const canDelete = owns || user?.role === 'admin';
  const canReport = !!user && !owns;

  return (
    <div className="space-y-7">
      <Link to={`/subjects/${material.subjectId?._id || ''}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} aria-hidden="true" />{' '}
        {material.subjectId?.name || 'Back to subject'}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <MaterialHeader
            material={material}
            uploader={uploader}
            voted={voted}
            upvoteBusy={upvoteBusy}
            canUpvote={!!user}
            onUpvote={upvote}
          />

          <MaterialPreview material={material} onDownload={download} />

          <CommentSection materialId={id} />
        </div>

        <MaterialSidebar
          material={material}
          canVerify={canVerify}
          canDelete={canDelete}
          canReport={canReport}
          verifyBusy={busy}
          onVerify={verify}
          onDelete={() => setConfirmDelete(true)}
          onReport={() => setReportOpen(true)}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this material?"
        description="The material and its uploaded file will be permanently removed. This action cannot be undone."
        confirmLabel="Delete material"
        variant="danger"
        busy={false}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      />

      <ReportDialog
        open={reportOpen}
        busy={reportBusy}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
      />
    </div>
  );
}