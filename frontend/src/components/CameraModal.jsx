import { useEffect, useRef, useState } from 'react'

function CameraModal({ onClose, onCapture }) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const [error, setError] = useState(null)
    const [ready, setReady] = useState(false)
    const [devices, setDevices] = useState([])
    const [deviceId, setDeviceId] = useState('')

    useEffect(() => {
        let cancelled = false

        async function start() {
            setError(null)
            setReady(false)

            if (!navigator.mediaDevices?.getUserMedia) {
                setError('Ta przeglądarka nie obsługuje kamery (wymagane HTTPS lub localhost).')
                return
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: deviceId
                        ? { deviceId: { exact: deviceId } }
                        : { facingMode: { ideal: 'environment' } },
                    audio: false,
                })
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                videoRef.current.srcObject = stream

                const all = await navigator.mediaDevices.enumerateDevices()
                setDevices(all.filter((d) => d.kind === 'videoinput'))
            } catch (err) {
                if (cancelled) return
                if (err.name === 'NotAllowedError') {
                    setError('Brak zgody na użycie kamery. Zezwól na dostęp w ustawieniach przeglądarki (ikona kamery w pasku adresu).')
                } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
                    setError('Nie znaleziono kamery. Podłącz kamerę lub wgraj zdjęcie z dysku.')
                } else if (err.name === 'NotReadableError') {
                    setError('Kamera jest zajęta przez inną aplikację. Zamknij ją i spróbuj ponownie.')
                } else {
                    setError('Nie udało się uruchomić kamery.')
                }
            }
        }

        start()

        return () => {
            cancelled = true
            streamRef.current?.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
    }, [deviceId])

    function capture() {
        const video = videoRef.current
        if (!video || !video.videoWidth) return
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        canvas.toBlob(
            (blob) => {
                if (blob) onCapture(URL.createObjectURL(blob))
            },
            'image/jpeg',
            0.95
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-[#1c1817]/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-3xl shadow-2xl border border-white/60 max-w-2xl w-full overflow-hidden my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-7 py-5 bg-white border-b border-[#ece6de] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-botanical-100 text-botanical-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">videocam</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#2b2725] tracking-tight">Skanuj skład INCI</h2>
                            <p className="text-xs text-[#736c68] mt-0.5">
                                Ustaw etykietę tak, aby tekst był ostry i dobrze oświetlony.
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

                <div className="p-6 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-[#1a1716] aspect-video flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={() => setReady(true)}
                            className={`w-full h-full object-contain ${error ? 'hidden' : ''}`}
                        />
                        {error && (
                            <div className="p-6 text-center space-y-2">
                                <span className="material-symbols-outlined text-4xl text-amber-400">videocam_off</span>
                                <p className="text-sm text-white/90 max-w-sm">{error}</p>
                            </div>
                        )}
                        {!error && !ready && (
                            <p className="absolute text-sm text-white/70">Uruchamianie kamery...</p>
                        )}
                    </div>

                    {devices.length > 1 && (
                        <div className="flex items-center gap-2 text-xs text-[#736c68]">
                            <span className="material-symbols-outlined text-base">cameraswitch</span>
                            <select
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                className="flex-1 rounded-lg border border-[#dfd9d1] bg-white px-2 py-1.5 text-xs"
                            >
                                <option value="">Kamera domyślna</option>
                                {devices.map((d, i) => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {d.label || `Kamera ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="px-7 py-4 bg-white border-t border-[#ece6de] flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-[#dfd9d1] hover:bg-surface-low text-xs font-semibold text-[#5c5652] transition-colors"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={capture}
                        disabled={!ready || !!error}
                        className="bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                        Zrób zdjęcie
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CameraModal