import AnalysisCard from './AnalysisCard'

const neutralTag = 'bg-surface-container text-on-surface-variant'

const analyses = [
    {
        brand: 'The Ordinary',
        name: 'Serum z kwasem hialuronowym 2% + B5',
        status: {
            text: 'Wzorowy skład',
            chip: 'bg-secondary-container/60 text-secondary border-secondary-fixed',
            dot: 'bg-secondary',
            scoreColor: 'text-secondary',
        },
        score: 98,
        notesLabel: 'Kluczowe składniki aktywne:',
        tags: [
            { text: 'Kwas hialuronowy', className: neutralTag },
            { text: 'Pantenol (B5)', className: neutralTag },
            { text: 'Gliceryna', className: neutralTag },
        ],
    },
    {
        brand: 'CeraVe',
        name: 'Rozświetlający krem pod oczy',
        status: {
            text: 'Dobry skład • 1 potencjalny alergen',
            chip: 'bg-tertiary-fixed/60 text-tertiary border-tertiary-fixed',
            dot: 'bg-tertiary',
            scoreColor: 'text-tertiary',
        },
        score: 84,
        notesLabel: 'Uwagi formulacyjne:',
        tags: [
            { text: 'Ceramidy 1, 3, 6-II', className: neutralTag },
            { text: 'Limonene (Alergen)', className: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant font-medium' },
        ],
    },
    {
        brand: 'Dermedic',
        name: 'Oczyszczający żel do twarzy',
        status: {
            text: 'Uwaga: mocne detergenty (SLS/SLES)',
            chip: 'bg-error-container/60 text-error border-error-container',
            dot: 'bg-error',
            scoreColor: 'text-error',
        },
        score: 62,
        notesLabel: 'Wykryte składniki drażniące:',
        tags: [
            { text: 'Sodium Laureth Sulfate', className: 'bg-error-container/40 text-on-error-container font-medium' },
            { text: 'BHT', className: 'bg-error-container/40 text-on-error-container font-medium' },
        ],
    },
]

function RecentAnalyses() {
    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Ostatnie analizy</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                        Szczegółowy wgląd w Twoje ostatnio weryfikowane kosmetyki
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex p-1 bg-surface-container rounded-xl text-label-md font-label-md">
                        <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary font-semibold shadow-xs">
                            Wszystkie
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-medium transition-colors">
                            Wzorowy skład
                        </button>
                    </div>
                    <a className="hidden lg:inline-flex items-center gap-1.5 text-label-md font-label-md text-primary hover:text-primary-container font-semibold transition-colors pl-2" href="#">
                        <span>Zobacz pełną historię</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((a) => (
                    <AnalysisCard key={a.name} {...a} />
                ))}
            </div>
        </section>
    )
}

export default RecentAnalyses