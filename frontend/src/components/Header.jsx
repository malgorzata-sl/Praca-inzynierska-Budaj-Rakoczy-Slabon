function Header() {
    return (
        <header className="bg-surface/80 backdrop-blur-md top-0 sticky z-50 shadow-sm">
            <div className="flex items-center justify-between px-8 py-3.5 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-8">
                    <a className="flex items-center gap-2 group" href="#">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                            <span
                                className="material-symbols-outlined text-[20px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                eco
                            </span>
                        </div>
                        <span className="text-headline-md font-headline-md font-semibold tracking-tight text-primary">
                            SkiN
                        </span>
                    </a>

                    <nav className="hidden md:flex items-center gap-6">
                        <a className="text-primary font-semibold border-b-2 border-primary pb-1 text-label-lg font-label-lg" href="#">Panel główny</a>
                        <a className="text-on-surface-variant hover:text-on-surface font-medium transition-colors text-label-lg font-label-lg" href="#">Skaner INCI</a>
                        <a className="text-on-surface-variant hover:text-on-surface font-medium transition-colors text-label-lg font-label-lg" href="#">Moje analizy</a>
                        <a className="text-on-surface-variant hover:text-on-surface font-medium transition-colors text-label-lg font-label-lg" href="#">Ulubione</a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block w-72">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                            search
                        </span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded-xl text-body-sm font-body-sm text-on-surface placeholder:text-outline/70 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                            placeholder="Szukaj kosmetyku lub składnika INCI..."
                            type="text"
                        />
                    </div>

                    <button className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-xl text-label-lg font-label-lg font-medium shadow-sm transition-all">
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        <span>Nowe skanowanie</span>
                    </button>

                    <div className="flex items-center gap-2.5 pl-1.5 py-1 pr-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30">
                        <span className="text-label-md font-label-md text-on-surface">Anna</span>
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                            keyboard_arrow_down
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header