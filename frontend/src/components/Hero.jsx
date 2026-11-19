import { useRef, useState } from 'react'
import UploadCard from './UploadCard'
import CameraModal from './CameraModal'
import ScanPreviewModal from './ScanPreviewModal'
import ProductDefineModal from './ProductDefineModal'

function Hero() {
    const inputRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [step, setStep] = useState(null) // null | 'camera' | 'scan' | 'define'
    const [source, setSource] = useState('file') // 'file' | 'camera'

    function handleFile(f) {
        if (!f || !f.type.startsWith('image/')) return
        setPreview(URL.createObjectURL(f))
        setSource('file')
        setStep('scan')
        //plik do backendu (OCR)
    }

    function handleCapture(url) {
        setPreview(url)
        setSource('camera')
        setStep('scan')
    }

    function handleRetry() {
        if (source === 'camera') {
            setStep('camera')
        } else {
            setStep(null)
            inputRef.current.click()
        }
    }

    function handleSave(product) {
        console.log('Zapisany produkt:', product)
        //produkt + składniki do backendu / Supabase
        setStep(null)
    }

    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-8 md:p-10 border border-outline-variant/30 custom-warm-shadow">
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-surface-variant/40 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/40 text-secondary text-label-md font-label-md border border-secondary-fixed/40">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    <span className="font-medium">Baza zweryfikowana dermatologicznie</span>
                </div>
                <p className="text-label-lg font-label-lg text-secondary tracking-wide font-medium">
                    Witaj ponownie, Anno ✨
                </p>
                <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight leading-tight">
                    Twój osobisty asystent świadomej pielęgnacji cery
                </h1>
                <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl leading-relaxed pt-1">
                    Błyskawicznie sprawdzaj składy INCI, wykrywaj potencjalne komedogeny, alergeny i drażniące detergenty oraz dbaj o bezpieczeństwo swojej codziennej rutyny.
                </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-5 pt-8 md:grid-cols-2">
                <div
                    onClick={() => setStep('camera')}
                    className="group relative overflow-hidden bg-secondary text-on-secondary rounded-2xl p-6 flex flex-col justify-between custom-hover-lift cursor-pointer shadow-md"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/15 backdrop-blur-sm flex items-center justify-center">
                                <span className="material-symbols-outlined text-[26px]">videocam</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-lowest/20 tracking-wider font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
                                OCR LIVE
                            </span>
                        </div>
                        <div>
                            <h3 className="text-headline-sm font-headline-sm font-semibold">Zeskanuj skład INCI</h3>
                            <p className="text-body-sm font-body-sm text-on-secondary/80 mt-1.5 leading-snug">
                                Aparat komputera lub kamery na żywo z natychmiastowym rozpoznawaniem tekstu OCR.
                            </p>
                        </div>
                    </div>
                    <div className="pt-6 flex items-center text-label-lg font-label-lg gap-2 group-hover:translate-x-1 transition-transform font-medium">
                        <span>Uruchom kamerę</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                </div>

                <UploadCard onPick={() => inputRef.current.click()} onFile={handleFile} />
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    handleFile(e.target.files[0])
                    e.target.value = ''
                }}
            />

            {step === 'camera' && (
                <CameraModal onClose={() => setStep(null)} onCapture={handleCapture} />
            )}

            <ScanPreviewModal
                key={preview}
                isOpen={step === 'scan'}
                onClose={() => setStep(null)}
                onRetry={handleRetry}
                imageUrl={preview}
                onCropped={(blob, url) => setPreview(url)}
                onConfirm={() => setStep('define')}
            />

            <ProductDefineModal
                key={`define-${preview}`}
                isOpen={step === 'define'}
                onClose={() => setStep(null)}
                onBack={() => setStep('scan')}
                onSave={handleSave}
            />
        </section>
    )
}

export default Hero