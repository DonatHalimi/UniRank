import { ArrowUp, Download, FileText, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import RoleBadge from './RoleBadge.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';
import { formatDate, labelFor } from '../utils/format.js';

const icons = {
  past_exam: FileText,
  summary: FileText,
  lecture_note: FileText,
  cheat_sheet: Presentation,
};

export default function MaterialCard({ material, onUpvote, currentUser }) {
  const Icon = icons[material.fileType] || FileText;
  const uploader = material.uploaderId || {};
  const voted =
    currentUser &&
    material.upvotedBy?.some((id) => String(id) === String(currentUser._id));

  return (
    <article className="surface group p-5 transition hover:-translate-y-0.5 hover:border-slate-600">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-indigo-400/10 p-3 text-indigo-300">
          <Icon size={21} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/materials/${material._id}`}
              className="font-semibold text-white hover:text-accent"
            >
              {material.title}
            </Link>
            {material.verifiedByAuthority && <VerifiedBadge />}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
            {material.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{uploader.username || 'Unknown contributor'}</span>
          {uploader.role && <RoleBadge role={uploader.role} />}
          <span aria-hidden="true">·</span>
          <span>{formatDate(material.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{labelFor(material.targetTier)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Download size={14} aria-hidden="true" /> {material.downloadCount || 0}
          </span>

          <button
            type="button"
            onClick={() => onUpvote?.(material._id)}
            disabled={!currentUser}
            aria-label={voted ? 'Remove upvote' : 'Upvote material'}
            aria-pressed={!!voted}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition ${voted
                ? 'bg-indigo-400/20 text-indigo-200'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
              } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <ArrowUp size={15} aria-hidden="true" /> {material.upvotes || 0}
          </button>
        </div>
      </div>
    </article>
  );
}