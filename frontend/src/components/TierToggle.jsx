export default function TierToggle({ value, onChange }) {
  return <div className="inline-flex rounded-xl border border-line bg-ink p-1" role="group" aria-label="Material tier">
    <button type="button" onClick={() => onChange('bare_minimum')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${value === 'bare_minimum' ? 'bg-indigo-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Bare Minimum</button>
    <button type="button" onClick={() => onChange('max_distinction')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${value === 'max_distinction' ? 'bg-emerald-300 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Max Distinction</button>
  </div>;
}
