import { Clock, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    FacebookIconMonochrome,
    GithubIcon,
    InstagramIcon,
    LinkedInIcon,
} from '../components/Icons';
// import logoIcon from '../public/logo.png';

const LAUNCH_YEAR = 2026;

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const yearLabel =
        currentYear === LAUNCH_YEAR ? `${LAUNCH_YEAR}` : `${LAUNCH_YEAR} - ${currentYear}`;

    const footerLinks = {
        social: [
            {
                href: 'https://facebook.com',
                icon: <FacebookIconMonochrome className="h-5 w-5 fill-current" />,
                label: 'Facebook',
            },
            {
                href: 'https://instagram.com',
                icon: <InstagramIcon className="h-5 w-5 fill-current" />,
                label: 'Instagram',
            },
            {
                href: 'https://www.linkedin.com/in/donat-halimi-0719b0193/',
                icon: <LinkedInIcon className="h-5 w-5 fill-current" />,
                label: 'LinkedIn',
            },
            {
                href: 'https://github.com/DonatHalimi',
                icon: <GithubIcon className="h-5 w-5 fill-current" />,
                label: 'GitHub',
            },
        ],

        explore: [
            { to: '/subjects', label: 'Browse subjects' },
            { to: '/materials/upload', label: 'Upload material' },
            { to: '/leaderboard', label: 'Leaderboard' },
            { to: '/register', label: 'Create account' },
        ],

        support: [
            { to: '/contact', label: 'Contact us' },
            { to: '/faq', label: 'FAQs' },
            { to: '/privacy', label: 'Privacy policy' },
            { to: '/terms', label: 'Terms of service' },
        ],

        contact: [
            {
                linkType: 'external',
                href: 'mailto:support@unirank.app',
                icon: <Mail className="h-5 w-5 shrink-0" />,
                label: 'support@unirank.app',
            },
            {
                linkType: 'internal',
                to: '/contact',
                icon: <MapPin className="h-5 w-5 shrink-0" />,
                label: 'Prishtina, Kosovo',
            },
            {
                linkType: 'internal',
                to: '/trust',
                icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
                label: 'Trust & safety',
            },
        ],
    };

    return (
        <footer className="mt-24 border-t border-white/10 bg-panel">
            <div className="container-shell py-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <img src="/logo.png" alt="UniRank" className="h-9 w-9 rounded-xl object-cover" />

                        <p className="mb-4 mt-4 text-sm leading-6 text-slate-400">
                            Share notes, past exams, and study resources with your peers.
                            Build your academic reputation and climb the leaderboard —
                            minimum effort, maximum results.
                        </p>

                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
                            Stay connected
                        </p>

                        <div className="flex gap-4">
                            {footerLinks.social.map(({ href, icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="text-slate-400 transition-colors hover:text-indigo-300"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
                            Explore
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.explore.map(({ to, label }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="text-sm text-slate-400 transition-colors hover:text-indigo-300"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
                            Support
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.support.map(({ to, label }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="text-sm text-slate-400 transition-colors hover:text-indigo-300"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">
                            Get in touch
                        </h3>
                        <p className="mb-4 text-sm text-slate-400">
                            Questions about a resource or a report? We&apos;re happy to help.
                        </p>

                        <ul className="space-y-3">
                            {footerLinks.contact.map(({ linkType, href, to, icon, label }) => {
                                const cls =
                                    'flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-indigo-300';
                                return (
                                    <li key={label}>
                                        {linkType === 'external' ? (
                                            <a href={href} className={cls}>
                                                {icon}
                                                <span>{label}</span>
                                            </a>
                                        ) : (
                                            <Link to={to} className={cls}>
                                                {icon}
                                                <span>{label}</span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
                    <span>&copy; {yearLabel} UniRank. All rights reserved.</span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Support · Mon – Sat · 9:00 – 20:00
                    </span>
                    <span>
                        Crafted by{' '}
                        <a
                            href="https://github.com/DonatHalimi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-200 underline decoration-white/20 underline-offset-2 transition-colors hover:text-indigo-300"
                        >
                            Donat Halimi
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}