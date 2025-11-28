import React, { useCallback } from 'react';
import { UploadIcon } from './Icons';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    previewUrl: string | null;
    accept?: string;
    label: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, previewUrl, accept = "image/*", label }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full h-48 relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-pink-300 transition-colors bg-slate-50 group">
            {previewUrl ? (
                <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Change Image</p>
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <UploadIcon />
                    <p className="text-slate-500 text-sm font-medium">{label}</p>
                    <p className="text-slate-400 text-xs mt-1">Click to browse</p>
                </div>
            )}
            <input 
                type="file" 
                accept={accept} 
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
};
