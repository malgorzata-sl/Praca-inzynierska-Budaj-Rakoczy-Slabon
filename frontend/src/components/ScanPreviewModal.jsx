import { useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const rawIngredients = [
    { name: 'Aqua', tone: 'ok' },
    { name: 'Niacinamide', tone: 'ok' },
    { name: 'Glycerin', tone: 'ok' },
    { name: 'Ceramide NP', tone: 'ok' },
    { name: 'Sodium Hyaluronate', tone: 'ok' },
    { name: 'Panthenol', tone: 'ok' },
    { name: 'Sodium Benzoate', tone: 'warn' },
    { name: 'Citric Acid', tone: 'warn' },
]

const recognized = [
    { name: 'Aqua (Woda oczyszczona)', conf: 99, dot: 'bg-botanical-600' },
    { name: 'Niacinamide (Wit. B3)', conf: 99, dot: 'bg-botanical-600' },
    { name: 'Ceramide NP', conf: 98, dot: 'bg-botanical-600' },
    { name: 'Sodium Hyaluronate', conf: 98, dot: 'bg-botanical-600' },
    { name: 'Glycerin', conf: 99, dot: 'bg-botanical-600' },
    { name: 'Panthenol (Wit. B5)', conf: 99, dot: 'bg-botanical-600' },
    { name: 'Citric Acid (Regulator pH)', conf: 96, dot: 'bg-amber-500' },
]

const tones = {
    ok: 'bg-emerald-100 text-emerald-900',
    warn: 'bg-amber-100 text-amber-900',
}

async function getCroppedBlob(image, crop) {
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(crop.width * scaleX)
    canvas.height = Math.round(crop.height * scaleY)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    )
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95))
}

function ScanPreviewModal({ isOpen, onClose, onRetry, imageUrl, onCropped, onConfirm }) {
    const imgRef = useRef(null)
    const [isCropping, setIsCropping] = useState(false)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState(null)

    if (!isOpen) return null

    async function saveCrop() {
        if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return
        const blob = await getCroppedBlob(imgRef.current, completedCrop)
        onCropped(blob, URL.createObjectURL(blob))
        setIsCropping(false)
        setCrop(undefined)
        setCompletedCrop(null)
    }

    function cancelCrop() {
        setIsCropping(false)
        setCrop(undefined)
        setCompletedCrop(null)
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-[#1c1817]/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-3xl shadow-2xl border border-white/60 max-w-5xl w-full overflow-hidden flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nagłówek */}
                <div className="px-7 py-5 bg-white border-b border-[#ece6de] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-botanical-100 text-botanical-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">document_scanner</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[#2b2725] tracking-tight">
                                    Podgląd skanu i weryfikacja tekstu OCR
                                </h2>
                                <span className="bg-botanical-100 text-botanical-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-botanical-600 animate-pulse"></span>
                                    Sukces (98% pewności)
                                </span>
                            </div>
                            <p className="text-xs text-[#736c68] mt-0.5">
                                Porównaj zdjęcie ze zdekodowaną listą składników przed zapisem lub edycją.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-surface-low hover:bg-surface-container text-[#6e6865] hover:text-[#2b2725] flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Treść */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface">
                    {/* Lewa kolumna: zdjęcie */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6e6865] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-brand-700">image</span>
                            Wgrane zdjęcie etykiety
                        </span>

                        <div className="relative rounded-2xl overflow-hidden border border-[#dfd9d1] bg-[#1a1716] shadow-inner flex items-center justify-center p-2">
                            {isCropping ? (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageUrl}
                                        alt="Zdjęcie etykiety"
                                        className="max-h-80 w-auto"
                                    />
                                </ReactCrop>
                            ) : (
                                <img
                                    src={imageUrl}
                                    alt="Zdjęcie etykiety ze składem INCI"
                                    className="max-h-80 w-auto"
                                />
                            )}
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-[#eae4dc] flex items-center justify-between text-xs">
                            {isCropping ? (
                                <>
                                    <button
                                        onClick={cancelCrop}
                                        className="text-[#5c5652] hover:underline font-semibold"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        onClick={saveCrop}
                                        className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        Zapisz kadr
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsCropping(true)}
                                        className="text-brand-700 hover:underline font-semibold flex items-center gap-0.5"
                                    >
                                        <span className="material-symbols-outlined text-sm">crop</span>
                                        Zmień kadr
                                    </button>
                                    <button
                                        onClick={onRetry}
                                        className="text-brand-700 hover:underline font-semibold flex items-center gap-0.5"
                                    >
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Wybierz inne
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Prawa kolumna: tekst i składniki */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#6e6865] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-botanical-600">spellcheck</span>
                                Zeskanowany tekst &amp; rozpoznane składniki
                            </span>
                            <button className="text-xs text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">edit_note</span>
                                Edytuj tekst OCR
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-[#eae4dc] shadow-sm">
                            <div className="pb-2 mb-2 border-b border-[#f1ede7]">
                                <span className="text-[11px] font-semibold text-[#8c8581] uppercase tracking-wider">
                                    Surowy ciąg odczytany z etykiety
                                </span>
                            </div>
                            <div className="font-mono text-xs leading-relaxed text-[#3a3533] bg-surface-low p-3 rounded-xl border border-[#ece6de] max-h-24 overflow-y-auto select-text">
                                <span className="text-[#8c8581]">INGREDIENTS: </span>
                                {rawIngredients.map((i, idx) => (
                                    <span key={i.name}>
                                        <mark className={`${tones[i.tone]} rounded px-1 py-0.5`}>{i.name}</mark>
                                        {idx < rawIngredients.length - 1 ? ', ' : '.'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-[#eae4dc] shadow-sm">
                            <div className="pb-2 mb-2 border-b border-[#f1ede7] flex items-center gap-2">
                                <span className="text-xs font-bold text-[#2b2725]">
                                    Zidentyfikowane składniki w bazie SkiN
                                </span>
                                <span className="text-[11px] bg-brand-50 text-brand-800 font-semibold px-2 py-0.5 rounded-full">
                                    {recognized.length}/{rawIngredients.length} dopasowano
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                                {recognized.map((r) => (
                                    <div
                                        key={r.name}
                                        className="flex items-center justify-between p-2 rounded-xl bg-surface-low hover:bg-surface-container border border-[#ece6de] text-xs transition-colors"
                                    >
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.dot}`}></span>
                                            <span className="font-medium text-[#2b2725] truncate">{r.name}</span>
                                        </div>
                                        <span className="text-[10px] text-botanical-700 font-semibold bg-botanical-50 px-1.5 py-0.5 rounded">
                                            {r.conf}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stopka */}
                <div className="px-7 py-4 bg-white border-t border-[#ece6de] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onRetry}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#dfd9d1] hover:bg-surface-low text-xs font-semibold text-[#5c5652] transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            Powtórz skanowanie
                        </button>
                        <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#dfd9d1] hover:bg-surface-low text-xs font-semibold text-[#5c5652] transition-colors flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-base">edit</span>
                            Popraw skład ręcznie
                        </button>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <span className="hidden md:inline text-xs text-[#8c8581]">
                            Krok 1 z 2: Weryfikacja skanu
                        </span>
                        <button onClick={onConfirm} className="w-full sm:w-auto bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                            <span>Zatwierdź i zdefiniuj produkt</span>
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScanPreviewModal