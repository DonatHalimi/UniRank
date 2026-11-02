import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Search, ShieldCheck, Sparkles, UploadCloud, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import MaterialCard from '../components/MaterialCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Home() {
  const [stats, setStats] = useState({ materials: 0, subjects: 0, contributors: 0 });
  const [popular, setPopular] = useState([]); const [universities, setUniversities] = useState([]); const [faculties, setFaculties] = useState([]);
  const [university, setUniversity] = useState(''); const [faculty, setFaculty] = useState(''); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true);
  const { user } = useAuth(); const navigate = useNavigate();
  useEffect(() => {
    Promise.all([api.get('/meta/stats'), api.get('/subjects/universities')]).then(([a, b]) => {
      setStats(a.data.data.stats); setPopular(a.data.data.popularMaterials); setUniversities(b.data.data);
    }).catch(() => toast.error('Could not load the UniRank overview.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!university) { setFaculties([]); setFaculty(''); return; }
    api.get('/subjects/faculties', { params: { university } }).then(({ data }) => setFaculties(data.data)).catch(() => setFaculties([]));
  }, [university]);
  function browse(event) {
    event.preventDefault(); const query = new URLSearchParams();
    if (university) query.set('university', university); if (faculty) query.set('faculty', faculty); if (search.trim()) query.set('search', search.trim());
    navigate(`/subjects?${query}`);
  }
  async function upvote(id) {
    if (!user) return toast.error('Sign in to vote on materials.');
    try { await api.patch(`/materials/${id}/upvote`); const { data } = await api.get('/meta/stats'); setPopular(data.data.popularMaterials); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not update vote.'); }
  }
  return <>
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#182446] via-[#111a2d] to-[#11172a] px-6 py-14 shadow-glow sm:px-12 sm:py-20"><div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" /><div className="relative z-10 max-w-3xl">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-indigo-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-indigo-200"><Sparkles size={14} /> Student-powered knowledge</span>
      <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">Minimum effort.<br /><span className="text-accent">Maximum results.</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Find past exams, trusted lecture notes and focused study material shared by your university community.</p>
      <form onSubmit={browse} className="mt-9 grid gap-3 rounded-2xl border border-white/10 bg-ink/70 p-3 backdrop-blur sm:grid-cols-[1.15fr_1fr_1fr_auto]">
        <label className="sr-only" htmlFor="university">University</label><select id="university" className="field" value={university} onChange={(e) => { setUniversity(e.target.value); setFaculty(''); }}><option value="">Choose university</option>{universities.map((u) => <option key={u}>{u}</option>)}</select>
        <label className="sr-only" htmlFor="faculty">Faculty</label><select id="faculty" className="field" value={faculty} onChange={(e) => setFaculty(e.target.value)} disabled={!university}><option value="">Choose faculty</option>{faculties.map((f) => <option key={f}>{f}</option>)}</select>
        <label className="sr-only" htmlFor="keyword">Search subjects</label><input id="keyword" className="field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Subject or course code" />
        <button className="button-primary justify-center"><Search size={16} /> Browse</button>
      </form>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400"><span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-300" /> Professor-verified resources</span><span className="flex items-center gap-1.5"><Users size={14} /> Community contributions</span></div>
    </div></section>
    <section className="mt-8 grid gap-4 sm:grid-cols-3">{[{ label: 'Study materials', value: stats.materials, icon: BookOpen }, { label: 'University subjects', value: stats.subjects, icon: GraduationCap }, { label: 'Contributors', value: stats.contributors, icon: Users }].map(({ label, value, icon: Icon }) => <div key={label} className="surface flex items-center gap-4 p-5"><span className="rounded-xl bg-white/5 p-3 text-accent"><Icon size={20} /></span><div><p className="text-2xl font-bold text-white">{value.toLocaleString()}</p><p className="text-sm text-slate-400">{label}</p></div></div>)}</section>
    <section className="mt-20 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="eyebrow">Two ways to prepare</p><h2 className="section-title mt-3">Study for the grade you need.</h2><p className="mt-4 leading-7 text-slate-400">Every subject separates practical essentials from deeper, distinction-level resources. Choose the depth that matches your goal.</p><Link to="/subjects" className="button-secondary mt-7">Explore subjects <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2"><div className="surface p-6"><div className="mb-5 inline-flex rounded-xl bg-indigo-400/10 p-3 text-indigo-200"><BookOpen size={22} /></div><h3 className="text-lg font-semibold text-white">Bare Minimum</h3><p className="mt-2 text-sm leading-6 text-slate-400">Core concepts, essential summaries and past exams to help you prepare efficiently.</p><span className="mt-5 inline-flex rounded-full bg-indigo-400/10 px-3 py-1 text-xs text-indigo-200">Pass-focused</span></div><div className="surface p-6"><div className="mb-5 inline-flex rounded-xl bg-emerald-300/10 p-3 text-emerald-200"><GraduationCap size={22} /></div><h3 className="text-lg font-semibold text-white">Max Distinction</h3><p className="mt-2 text-sm leading-6 text-slate-400">Advanced notes, comprehensive resources and challenging practice for top results.</p><span className="mt-5 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">A+ preparation</span></div></div></section>
    <section className="mt-20"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Community favourites</p><h2 className="section-title mt-2">Popular materials</h2></div><Link to="/subjects" className="nav-link">Browse all <ArrowRight size={15} /></Link></div>{loading ? <LoadingSkeleton rows={3} /> : popular.length ? <div className="grid gap-4">{popular.map((item) => <MaterialCard key={item._id} material={item} currentUser={user} onUpvote={upvote} />)}</div> : <div className="surface p-8 text-center text-slate-400">No materials have been shared yet. Be the first to contribute.</div>}</section>
    <section className="mt-16 rounded-3xl border border-white/10 bg-white/[.03] p-7 sm:flex sm:items-center sm:justify-between sm:p-9"><div><h2 className="text-2xl font-semibold text-white">Have useful course material?</h2><p className="mt-2 text-sm text-slate-400">Share it with your university community and build your contributor reputation.</p></div><Link to={user ? '/materials/upload' : '/register'} className="button-primary mt-5 shrink-0 sm:mt-0"><UploadCloud size={16} /> Share a resource</Link></section>
  </>;
}
