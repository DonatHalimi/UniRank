import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../Avatar.jsx';
import RoleBadge from '../RoleBadge.jsx';
import VerifiedBadge from '../VerifiedBadge.jsx';
import { formatDate, labelFor } from '../../utils/format.js';

export default function MaterialHeader({
    material,
    uploader,
    voted,
    upvoteBusy,
    canUpvote,
    onUpvote,
}) {
    return (
        <section className="surface p-5 sm:p-7">
            {/* Top row: chips + upvote */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="chip">{labelFor(material.fileType)}</span>
                    <span className="chip">{labelFor(material.targetTier)}</span>
                    {material.verifiedByAuthority && <VerifiedBadge />}
                </div>

                <button
                    type="button"
                    onClick={onUpvote}
                    disabled={upvoteBusy || !canUpvote}
                    aria-label={voted ? 'Remove upvote' : 'Upvote material'}
                    aria-pressed={!!voted}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${voted
                            ? 'bg-indigo-400/20 text-indigo-200'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <ArrowUp size={15} aria-hidden="true" />
                    {material.upvotes || 0}
                </button>
            </div>

            {/* Title + description */}
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {material.title}
            </h1>
            <p className="mt-3 leading-7 text-slate-300">
                {material.description || 'No description provided.'}
            </p>

            {/* Uploader */}
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <Avatar name={uploader.username || '?'} size="md" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                            to={`/profile/${uploader.username}`}
                            className="truncate font-medium text-white hover:text-accent"
                            dir="auto"
                        >
                            {uploader.username}
                        </Link>
                        {uploader.role && <RoleBadge role={uploader.role} />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Uploaded {formatDate(material.createdAt)}
                    </p>
                </div>
            </div>
        </section>
    );
}