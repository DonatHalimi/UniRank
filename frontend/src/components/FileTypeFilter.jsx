import { labelFor } from '../utils/format.js';
const types = ['', 'past_exam', 'summary', 'lecture_note', 'cheat_sheet'];
export default function FileTypeFilter({ value, onChange }) {
  return <div className="flex flex-wrap gap-2" aria-label="Filter by file type">{types.map((type) => <button key={type || 'all'} type="button" onClick={() => onChange(type)} className={`chip ${value === type ? 'chip-active' : ''}`}>{type ? labelFor(type) : 'All materials'}</button>)}</div>;
}
