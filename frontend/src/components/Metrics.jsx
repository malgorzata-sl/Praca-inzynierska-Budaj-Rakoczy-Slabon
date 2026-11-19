const metrics = [
    {
        icon: 'science',
        label: 'Przeskanowane produkty',
        value: '28',
        note: '+6 w tym tyg.',
        noteIsBadge: true,
        iconBox: 'bg-surface-container text-secondary border-outline-variant/20',
    },
    {
        icon: 'spa',
        label: 'Czysty skład',
        value: '92%',
        note: 'bezpiecznych formuł',
        valueClass: 'text-secondary',
        iconBox: 'bg-secondary-container/40 text-secondary border-secondary-fixed/40',
        filled: true,
    },
    {
        icon: 'shield',
        label: 'Składniki aktywne',
        value: '18',
        note: 'wspierających barierę',
        iconBox: 'bg-surface-container text-secondary border-outline-variant/20',
    },
    {
        icon: 'favorite',
        label: 'Ulubione bez zastrzeżeń',
        value: '14',
        note: 'kosmetyków w szafce',
        iconBox: 'bg-surface-container text-tertiary border-outline-variant/20',
        filled: true,
    },
]

function Metrics() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m) => (
                <div
                    key={m.label}
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4 custom-hover-lift"
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${m.iconBox}`}>
                        <span
                            className="material-symbols-outlined text-[24px]"
                            style={m.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                            {m.icon}
                        </span>
                    </div>
                    <div>
                        <p className="text-label-md font-label-md text-on-surface-variant font-medium">{m.label}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className={`text-headline-lg font-headline-lg font-semibold ${m.valueClass ?? 'text-on-surface'}`}>
                                {m.value}
                            </span>
                            {m.noteIsBadge ? (
                                <span className="text-label-sm font-label-sm text-secondary bg-secondary-container/40 px-1.5 py-0.5 rounded-md font-semibold">
                                    {m.note}
                                </span>
                            ) : (
                                <span className="text-body-sm font-body-sm text-outline">{m.note}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

export default Metrics