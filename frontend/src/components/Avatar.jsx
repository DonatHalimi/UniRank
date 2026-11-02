const AVATAR_COLORS = [
    'bg-indigo-500/20 text-indigo-200',
    'bg-emerald-500/20 text-emerald-200',
    'bg-amber-500/20 text-amber-200',
    'bg-sky-500/20 text-sky-200',
    'bg-fuchsia-500/20 text-fuchsia-200',
    'bg-rose-500/20 text-rose-200',
];

export default function Avatar({ name, size = 'md' }) {
    const initials = (name || '?')
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
    const colorIndex =
        (name || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
        AVATAR_COLORS.length;
    const sizeClass = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs';
    return (
        <span
            aria-hidden="true"
            className={`${sizeClass} ${AVATAR_COLORS[colorIndex]} flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-white/10`}
        >
            {initials}
        </span>
    );
}