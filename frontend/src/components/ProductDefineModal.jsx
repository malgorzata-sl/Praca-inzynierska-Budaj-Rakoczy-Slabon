import { useState } from 'react'

const categories = ['Krem do twarzy', 'Serum', 'Tonik / Esencja', 'Żel do mycia', 'SPF', 'Inne']

const times = [
    { id: 'morning', label: 'Rano', icon: 'wb_sunny' },
    { id: 'evening', label: 'Wieczorem', icon: 'bedtime' },
    { id: 'occasional', label: 'Doraźnie / 1-2x w tyg.', icon: 'event_repeat' },
]

const goals = [
    { label: 'Odbudowa bariery', icon: 'shield' },
    { label: 'Nawilżenie', icon: 'water_drop' },
    { label: 'Trądzik / Pory', icon: 'blur_on' },
    { label: 'Anti-aging', icon: 'auto_awesome' },
]

function toggle(list, value) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function ProductDefineModal({ isOpen, onClose, onBack, onSave, ingredientsCount = 18 }) {
    const [name, setName] = useState('')
    const [brand, setBrand] = useState('')
    const [category, setCategory] = useState('Krem do twarzy')
    const [selectedTimes, setSelectedTimes] = useState([])
    const [selectedGoals, setSelectedGoals] = useState([])
    const [favorite, setFavorite] = useState(false)

    if (!isOpen) return null

    function handleSubmit(e) {
        e.preventDefault()
        onSave({
            name: name.trim(),
            brand: brand.trim(),
            category,
            times: selectedTimes,
            goals: selectedGoals,
            favorite,
        })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-inverse-surface/40 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl custom-warm-shadow overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nagłówek */}
                <div className="flex items-start justify-between p-6 sm:p-8 pb-4 border-b border-outline-variant/20 bg-surface-container-low/60">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-container/60 text-secondary text-label-sm font-label-sm font-semibold mb-1 border border-secondary-fixed">
                            <span
                                className="material-symbols-outlined text-[14px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                check_circle
                            </span>
                            <span>Zeskanowano skład kosmetyku!</span>
                        </div>
                        <h2 className="text-headline-md font-headline-md text-on-surface font-semibold tracking-tight">
                            Zdefiniuj zeskanowany kosmetyk
                        </h2>
                        <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed max-w-lg">
                            Rozpoznano {ingredientsCount} składników INCI. Uzupełnij podstawowe informacje, aby zapisać
                            produkt w Twojej kosmetyczce i przejść do pełnego raportu.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Zamknij"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Formularz */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-label-sm font-label-sm font-semibold text-on-surface flex items-center gap-1">
                                Własna nazwa produktu <span className="text-primary">*</span>
                            </label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-surface-container-lowest rounded-xl text-body-sm font-body-sm text-on-surface placeholder:text-outline/70 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                                placeholder="np. Mój nawilżający krem na noc"
                                type="text"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-label-sm font-label-sm font-semibold text-on-surface flex items-center justify-between">
                                <span>Marka / Producent</span>
                                <span className="text-outline font-normal text-[11px]">opcjonalnie</span>
                            </label>
                            <input
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-surface-container-lowest rounded-xl text-body-sm font-body-sm text-on-surface placeholder:text-outline/70 border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                                placeholder="np. CeraVe, The Ordinary"
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Kategoria */}
                    <div className="space-y-2">
                        <label className="text-label-sm font-label-sm font-semibold text-on-surface">
                            Kategoria produktu
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((c) => {
                                const active = category === c
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCategory(c)}
                                        className={`px-3 py-1.5 rounded-xl border text-label-sm font-label-sm flex items-center gap-1.5 cursor-pointer transition-colors ${active
                                                ? 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant font-semibold'
                                                : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium'
                                            }`}
                                    >
                                        {active && <span className="material-symbols-outlined text-[16px]">check</span>}
                                        {c}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pora stosowania */}
                    <div className="space-y-2">
                        <label className="text-label-sm font-label-sm font-semibold text-on-surface">
                            Pora stosowania w rutynie
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {times.map((t) => {
                                const active = selectedTimes.includes(t.id)
                                return (
                                    <label
                                        key={t.id}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${active
                                                ? 'border-primary bg-primary-fixed/20'
                                                : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container-high/60'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={active}
                                            onChange={() => setSelectedTimes(toggle(selectedTimes, t.id))}
                                            className="rounded text-primary focus:ring-primary/20"
                                        />
                                        <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'text-outline'}`}>
                                            {t.icon}
                                        </span>
                                        <span className={`text-label-sm font-label-sm ${active ? 'font-semibold text-primary' : 'font-medium text-on-surface'}`}>
                                            {t.label}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* Cel pielęgnacyjny */}
                    <div className="space-y-2">
                        <label className="text-label-sm font-label-sm font-semibold text-on-surface">
                            Główny cel pielęgnacyjny
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {goals.map((g) => {
                                const active = selectedGoals.includes(g.label)
                                return (
                                    <button
                                        key={g.label}
                                        type="button"
                                        onClick={() => setSelectedGoals(toggle(selectedGoals, g.label))}
                                        className={`px-3 py-1 rounded-lg border text-label-sm font-label-sm flex items-center gap-1 cursor-pointer transition-colors ${active
                                                ? 'border-secondary-fixed bg-secondary-container/60 text-secondary font-semibold'
                                                : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">{g.icon}</span>
                                        {g.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Ulubione */}
                    <div className="pt-2 border-t border-outline-variant/20">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={favorite}
                                onChange={(e) => setFavorite(e.target.checked)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                            />
                            <span
                                className="material-symbols-outlined text-[18px] text-primary"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                favorite
                            </span>
                            <span className="text-body-sm font-body-sm text-on-surface font-medium">
                                Dodaj od razu do ulubionych kosmetyków
                            </span>
                        </label>
                    </div>

                    {/* Przyciski */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline-variant/20">
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant font-label-lg text-label-lg font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Wróć do skanu
                        </button>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <span className="hidden md:inline text-xs text-outline">Krok 2 z 2: Definicja produktu</span>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md custom-hover-lift transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Zapisz i zobacz raport INCI</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductDefineModal