import { BookOpen } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description = 'Try changing your filters or check back later.', action }) {
  return <div className="surface flex flex-col items-center px-6 py-14 text-center"><div className="mb-4 rounded-2xl bg-white/5 p-4 text-accent"><BookOpen size={25} /></div><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
