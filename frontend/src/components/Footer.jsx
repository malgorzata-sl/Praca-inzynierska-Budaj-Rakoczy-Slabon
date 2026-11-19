const links = ['Polityka prywatności', 'Baza składników INCI', 'Metodologia ocen', 'Kontakt', 'Regulamin']

function Footer() {
    return (
        <footer className="bg-surface-container-low w-full border-t border-outline-variant/40 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-8 max-w-7xl mx-auto w-full gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary">eco</span>
                        <span className="text-headline-sm font-headline-sm font-semibold text-primary">SkiN</span>
                    </div>
                    <span className="hidden sm:inline-block text-outline-variant">•</span>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                        © 2025 SkiN. Świadoma pielęgnacja i bezpieczny skład kosmetyków.
                    </p>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-6 text-label-sm font-label-sm">
                    {links.map((l) => (
                        <a key={l} className="text-on-surface-variant hover:text-primary transition-colors duration-150" href="#">
                            {l}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    )
}

export default Footer