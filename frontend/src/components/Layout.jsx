import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
    return (
        <div className="min-h-screen bg-ink text-slate-100">
            <Navbar />

            <main className="container-shell min-h-[65vh] py-9 sm:py-12">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}