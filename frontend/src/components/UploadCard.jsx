//import { useRef, useState } from 'react'
//import ScanPreviewModal from './ScanPreviewModal'
//import ProductDefineModal from './ProductDefineModal'

function UploadCard({ onPick, onFile }) {
    return (
        <div
            onClick={onPick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault()
                onFile(e.dataTransfer.files[0])
            }}
            className="group bg-surface-container-lowest hover:bg-surface-bright border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between custom-hover-lift cursor-pointer shadow-sm"
        >
            <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
                </div>
                <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">
                        Wgraj zdjęcie z dysku
                    </h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5 leading-snug">
                        Przeciągnij i upuść zdjęcie etykiety (JPG, PNG, HEIC).
                    </p>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-outline-variant/20 mt-4">
                <span className="text-body-sm font-body-sm text-on-surface-variant">Przeciągnij plik tutaj</span>
                <span className="text-label-md font-label-md text-secondary font-semibold group-hover:underline">
                    Wybierz plik
                </span>
            </div>
        </div>
    )
}

export default UploadCard