function KnowledgeCallout() {
    return (
        <section className="rounded-3xl bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 custom-warm-shadow">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0 shadow-xs border border-secondary-fixed/30">
                    <span className="material-symbols-outlined text-[32px]">menu_book</span>
                </div>
                <div className="space-y-1">
                    <div className="text-label-sm font-label-sm font-semibold text-secondary uppercase tracking-wider">
                        Baza wiedzy kosmetycznej
                    </div>
                    <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">
                        Encyklopedia składników INCI
                    </h3>
                    <p className="text-body-md font-body-md text-on-surface-variant max-w-xl">
                        Dowiedz się więcej o komedogenności, potencjale drażniącym oraz optymalnych stężeniach kwasów AHA/BHA i retinoidów w domowej pielęgnacji.
                    </p>
                </div>
            </div>
            <div className="w-full lg:w-auto shrink-0">
                <a
                    className="block w-full lg:w-auto text-center px-6 py-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-bright text-secondary border border-outline-variant/30 font-label-lg text-label-lg font-semibold custom-hover-lift transition-all shadow-sm"
                    href="#"
                >
                    Przeglądaj bazę wiedzy
                </a>
            </div>
        </section>
    )
}

export default KnowledgeCallout