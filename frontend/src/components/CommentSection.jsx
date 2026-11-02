import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Trash2, CornerDownRight, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Avatar from './Avatar.jsx';
import { formatDate, showError } from '../utils/format.js';

// Maximum visual indent level. Deeper replies still render, but stop indenting.
const MAX_DEPTH = 3;

// Shared animation for expanding/collapsing sections
const collapseVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2 } },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.2, ease: 'easeIn' }, opacity: { duration: 0.15 } },
  },
};

function ReplyComposer({ targetName, value, onChange, onSubmit, onCancel, sending }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.form
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      onSubmit={onSubmit}
      className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-3"
    >
      <div
        dir="ltr"
        className="mb-2 flex items-center gap-2 text-xs text-slate-400 [unicode-bidi:isolate]"
      >
        <CornerDownRight size={13} aria-hidden="true" />
        <span>
          Replying to{' '}
          <bdi className="font-medium text-slate-200" dir="auto">
            {targetName || 'this comment'}
          </bdi>
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          aria-label="Cancel reply"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor="reply-body" className="sr-only">Write a reply</label>
        <textarea
          ref={inputRef}
          id="reply-body"
          className="field min-h-[44px] flex-1 resize-y placeholder:text-slate-400"
          rows={1}
          maxLength={500}
          value={value}
          onChange={onChange}
          placeholder="Write a reply…"
        />
        <button
          type="submit"
          className="button-primary shrink-0"
          disabled={sending || !value.trim()}
        >
          <Send size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Reply</span>
        </button>
      </div>
      <div className="mt-1 text-right text-xs text-slate-400">{value.length}/500</div>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */
/* CommentItem — hoisted to module scope so its identity is stable     */
/* ------------------------------------------------------------------ */
function CommentItem({
  comment,
  isReply = false,
  user,
  isReplying,
  replyBody,
  sending,
  onOpenReply,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
  onRequestDelete,
}) {
  const author = comment.authorId || {};
  const canDelete =
    user && (user.role === 'admin' || String(author._id) === String(user._id));
  const authorName = author.username || 'Deleted user';

  return (
    <article className="group flex gap-3">
      <Avatar name={authorName} size={isReply ? 'sm' : 'md'} />

      <div className="min-w-0 flex-1">
        <div
          dir="ltr"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 [unicode-bidi:isolate]"
        >
          <span className="font-medium text-white" dir="auto">
            {authorName}
          </span>
          {author.role && <RoleBadge role={author.role} />}
          <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
        </div>

        <p
          dir="auto"
          className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200"
        >
          {comment.body}
        </p>

        <div className="mt-1.5 flex items-center gap-1">
          {user && (
            <button
              type="button"
              onClick={() => onOpenReply(comment)}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(comment)}
              className="rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 hover:bg-rose-500/15 hover:text-rose-200"
              aria-label={
                String(author._id) !== String(user?._id)
                  ? 'Delete comment (admin)'
                  : 'Delete comment'
              }
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {isReplying && (
            <ReplyComposer
              targetName={authorName}
              value={replyBody}
              onChange={onReplyChange}
              onSubmit={onReplySubmit}
              onCancel={onReplyCancel}
              sending={sending}
            />
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* CommentNode — hoisted, receives tree + handlers via props           */
/* ------------------------------------------------------------------ */
function CommentNode({
  comment,
  depth = 0,
  childrenByParent,
  lookupAuthor,
  user,
  replyTo,
  replyBody,
  sending,
  onOpenReply,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
  onRequestDelete,
}) {
  const children = childrenByParent.get(String(comment._id)) || [];
  const isReply = depth > 0;
  const indent = Math.min(depth, MAX_DEPTH);
  const parentAuthorName = isReply ? lookupAuthor(comment.parentCommentId) : null;
  const isReplying = replyTo === comment._id;

  // Top-level comments with children start expanded; nested ones too.
  // For replies deeper than the root, the collapse toggle is handled by the root only.
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = children.length > 0;

  return (
    <div className={isReply ? 'relative' : ''}>
      {isReply && (
        <div
          dir="ltr"
          className="mb-1 flex items-center gap-1.5 text-xs text-slate-400 [unicode-bidi:isolate]"
        >
          <CornerDownRight size={12} aria-hidden="true" className="text-indigo-300/70" />
          <span>
            Replying to{' '}
            <bdi className="font-medium text-indigo-200" dir="auto">
              {parentAuthorName}
            </bdi>
          </span>
        </div>
      )}

      <CommentItem
        comment={comment}
        isReply={isReply}
        user={user}
        isReplying={isReplying}
        replyBody={replyBody}
        sending={sending}
        onOpenReply={onOpenReply}
        onReplyChange={onReplyChange}
        onReplySubmit={(event) => onReplySubmit(event, comment._id)}
        onReplyCancel={onReplyCancel}
        onRequestDelete={onRequestDelete}
      />

      {hasChildren && (
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="children"
              variants={collapseVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="relative mt-3 space-y-4 overflow-hidden"
            >
              <div
                className={
                  indent < MAX_DEPTH
                    ? 'border-l border-indigo-300/30 pl-4 sm:pl-5'
                    : 'pl-4 sm:pl-5'
                }
              >
                {children.map((child) => (
                  <CommentNode
                    key={child._id}
                    comment={child}
                    depth={depth + 1}
                    childrenByParent={childrenByParent}
                    lookupAuthor={lookupAuthor}
                    user={user}
                    replyTo={replyTo}
                    replyBody={replyBody}
                    sending={sending}
                    onOpenReply={onOpenReply}
                    onReplyChange={onReplyChange}
                    onReplySubmit={onReplySubmit}
                    onReplyCancel={onReplyCancel}
                    onRequestDelete={onRequestDelete}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Hide/show replies toggle — only shown on the root of a thread with children */}
      {!isReply && hasChildren && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
              aria-hidden="true"
            >
              <ChevronDown size={14} />
            </motion.span>
            {collapsed ? `Show ${children.length} ${children.length === 1 ? 'reply' : 'replies'}` : 'Hide replies'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CommentSection                                                      */
/* ------------------------------------------------------------------ */
export default function CommentSection({ materialId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const { data } = await api.get(`/materials/${materialId}/comments`, {
        params: { limit: 50 },
      });
      setComments(data.data.comments || []);
    } catch (error) {
      toast.error(showError(error, 'Could not load comments.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [materialId]);

  async function submit(event, parentCommentId = null) {
    event.preventDefault();
    const text = parentCommentId ? replyBody.trim() : body.trim();
    if (!text) return;
    setSending(true);
    try {
      await api.post(`/materials/${materialId}/comments`, {
        body: text,
        ...(parentCommentId ? { parentCommentId } : {}),
      });
      if (parentCommentId) {
        setReplyTo(null);
        setReplyBody('');
      } else {
        setBody('');
      }
      await load();
      toast.success(parentCommentId ? 'Reply posted.' : 'Comment posted.');
    } catch (error) {
      toast.error(showError(error, 'Could not post comment.'));
    } finally {
      setSending(false);
    }
  }

  function requestDelete(comment) {
    const author = comment.authorId || {};
    const isAdminDelete =
      user?.role === 'admin' && String(author._id) !== String(user?._id);
    setConfirmTarget({ comment, isAdminDelete });
  }

  async function performDelete() {
    if (!confirmTarget) return;
    const { comment } = confirmTarget;
    setDeleting(true);
    try {
      await api.delete(`/comments/${comment._id}`);
      setConfirmTarget(null);
      await load();
      toast.success('Comment deleted.');
    } catch (error) {
      toast.error(showError(error, 'Could not delete comment.'));
    } finally {
      setDeleting(false);
    }
  }

  function openReply(comment) {
    setReplyTo(replyTo === comment._id ? null : comment._id);
    setReplyBody('');
  }

  // Build parent -> children map once per render (cheap, O(n)).
  const childrenByParent = new Map();
  for (const c of comments) {
    const key = String(c.parentCommentId || '');
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(c);
  }

  const topLevel = comments.filter((c) => !c.parentCommentId);

  const lookupAuthor = (id) => {
    const found = comments.find((c) => String(c._id) === String(id));
    return found?.authorId?.username || 'a deleted comment';
  };

  return (
    <section className="surface p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">
          Discussion{' '}
          <span className="text-sm font-normal text-slate-400">({comments.length})</span>
        </h2>
      </div>

      {user ? (
        <form onSubmit={(event) => submit(event)} className="mb-7">
          <div className="flex gap-3">
            <Avatar name={user.username} />
            <div className="min-w-0 flex-1">
              <label htmlFor="comment" className="sr-only">Add a comment</label>
              <textarea
                id="comment"
                placeholder="Share a helpful note or ask a question…"
                maxLength={500}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="field min-h-24 w-full resize-y placeholder:text-slate-400"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">{body.length}/500</span>
                <button className="button-primary" disabled={sending || !body.trim()}>
                  <Send size={15} aria-hidden="true" /> Post comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="mb-6 rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-300">
          Sign in to join the discussion.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments…</p>
      ) : topLevel.length ? (
        <div className="space-y-5">
          {topLevel.map((comment) => (
            <div key={comment._id} className="border-t border-white/10 pt-5">
              <CommentNode
                comment={comment}
                depth={0}
                childrenByParent={childrenByParent}
                lookupAuthor={lookupAuthor}
                user={user}
                replyTo={replyTo}
                replyBody={replyBody}
                sending={sending}
                onOpenReply={openReply}
                onReplyChange={(event) => setReplyBody(event.target.value)}
                onReplySubmit={submit}
                onReplyCancel={() => {
                  setReplyTo(null);
                  setReplyBody('');
                }}
                onRequestDelete={requestDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No comments yet. Be the first to start the discussion.
        </p>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        busy={deleting}
        variant="danger"
        title={
          confirmTarget?.isAdminDelete
            ? 'Delete this comment as admin?'
            : 'Delete this comment?'
        }
        description={
          confirmTarget?.isAdminDelete
            ? "This will permanently remove another user's comment. This action cannot be undone."
            : 'This will permanently remove your comment. This action cannot be undone.'
        }
        confirmLabel={
          confirmTarget?.isAdminDelete ? 'Delete as admin' : 'Delete comment'
        }
        onCancel={() => {
          if (!deleting) setConfirmTarget(null);
        }}
        onConfirm={performDelete}
      />
    </section>
  );
}