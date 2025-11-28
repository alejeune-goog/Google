import React, { useState, useEffect } from 'react';
import { UploadZone } from './UploadZone';
import { ChevronDown, Image as ImageIcon } from 'lucide-react';

// --- SVG Assets ---

const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const GOOGLE_FULL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 92"><path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.54-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/><path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/><path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path fill="#4285F4" d="M35.29 41.41V32H66c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-22.98 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.34.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 24.95s10.84 25.03 24.7 25.03c9.08 0 14.03-3.61 17.39-6.97 2.77-2.86 4.54-6.97 5.54-12.43H35.29z"/></svg>`;

const YOUTUBE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`;

// YouTube Logo with text (Approximation using standard font or paths would be better, but this ensures standalone functionality)
const YOUTUBE_FULL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><g transform="scale(2.5)"><path fill="#FF0000" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></g><text x="65" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="40" fill="#212121" letter-spacing="-1">YouTube</text></svg>`;

interface GoogleProductSelectorProps {
    onFileSelect: (file: File) => void;
    previewUrl: string | null;
}

export const GoogleProductSelector: React.FC<GoogleProductSelectorProps> = ({ onFileSelect, previewUrl }) => {
    const [selection, setSelection] = useState<string>('custom');
    const [isConverting, setIsConverting] = useState(false);

    // Convert SVG string to PNG File
    const processPreset = async (svgString: string, filename: string) => {
        setIsConverting(true);
        try {
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });

            const canvas = document.createElement('canvas');
            // Set high resolution for quality
            canvas.width = 1000;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("No canvas context");

            // Draw white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate containment fit
            const scale = Math.min((canvas.width * 0.8) / img.width, (canvas.height * 0.8) / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;

            ctx.drawImage(img, x, y, w, h);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], filename, { type: 'image/png' });
                    onFileSelect(file);
                }
                URL.revokeObjectURL(url);
                setIsConverting(false);
            }, 'image/png');

        } catch (e) {
            console.error("Failed to process SVG preset", e);
            setIsConverting(false);
        }
    };

    const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelection(value);

        if (value === 'google') {
            processPreset(GOOGLE_SVG, 'google_logo.png');
        } else if (value === 'google_full') {
            processPreset(GOOGLE_FULL_SVG, 'google_full_logo.png');
        } else if (value === 'youtube') {
            processPreset(YOUTUBE_SVG, 'youtube_logo.png');
        } else if (value === 'youtube_full') {
            processPreset(YOUTUBE_FULL_SVG, 'youtube_full_logo.png');
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="relative">
                <select 
                    value={selection}
                    onChange={handleSelectionChange}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none cursor-pointer font-medium"
                >
                    <option value="custom">Upload Custom Image</option>
                    <option value="google_full">Google logo as name</option>
                    <option value="google">Google Logo (Icon)</option>
                    <option value="youtube">YouTube Logo</option>
                    <option value="youtube_full">YouTube Logo + Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="flex-1 relative">
                {isConverting && (
                    <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-xl">
                        <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                
                {/* We always render UploadZone, but it acts as a preview display if a preset is selected */}
                <UploadZone 
                    label="Drop product shot" 
                    onFileSelect={(file) => {
                        // If user manually drops a file, switch back to custom
                        setSelection('custom');
                        onFileSelect(file);
                    }}
                    previewUrl={previewUrl}
                />
            </div>
        </div>
    );
};