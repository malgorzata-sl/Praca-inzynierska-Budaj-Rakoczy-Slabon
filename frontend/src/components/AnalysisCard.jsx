function AnalysisCard({ brand, name, status, score, notesLabel, tags }) {
    return (
        <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 flex flex-col justify-between custom-hover-lift relative overflow-hidden">
            <div className="space-y-4">
                <div>
                    <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">{brand}</span>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold leading-snug line-clamp-1">
                        {name}
                    </h3>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold border ${status.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.text}
                </span>

                <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-outline-variant/20">
                    <span className="text-body-sm font-body-sm text-on-surface-variant font-medium">Ocena bezpieczeństwa:</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-headline-sm font-headline-sm font-bold ${status.scoreColor}`}>{score}</span>
                        <span className="text-body-sm font-body-sm text-outline">/100</span>
                    </div>
                </div>

                <div className="space-y-1.5 pt-1">
                    <span className="text-label-sm font-label-sm text-outline">{notesLabel}</span>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                            <span
                                key={t.text}
                                className={`px-2 py-0.5 rounded-md text-label-sm font-label-sm ${t.className}`}
                            >
                                {t.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-4 border-t border-outline-variant/20">
                <button className="text-label-md font-label-md text-primary hover:text-primary-container font-semibold transition-colors flex items-center gap-1">
                    Raport INCI
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
            </div>
        </article>
    )
}

export default AnalysisCard