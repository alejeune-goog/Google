import React from 'react';
import { 
    User, 
    Box, 
    Sparkles, 
    Image as ImageIcon, 
    Video, 
    Upload,
    Loader2,
    Play,
    AlertCircle,
    Maximize2,
    X,
    Download
} from 'lucide-react';

export const UserIcon = () => <User size={16} className="text-pink-500" />;
export const ProductIcon = () => <Box size={16} className="text-pink-500" />;
export const MagicIcon = () => <Sparkles size={16} className="text-pink-500" />;
export const PhotoIcon = () => <ImageIcon size={16} className="text-pink-500" />;
export const VideoIcon = () => <Video size={16} className="text-pink-500" />;
export const UploadIcon = () => <Upload size={24} className="text-slate-400 mb-2" />;
export const Spinner = () => <Loader2 size={24} className="animate-spin text-pink-500" />;
export const PlayIcon = () => <Play size={20} className="fill-white text-white ml-1" />;
export const ErrorIcon = () => <AlertCircle size={24} className="text-red-500" />;
export const ZoomIcon = () => <Maximize2 size={18} />;
export const CloseIcon = () => <X size={24} className="text-white" />;
export const DownloadIcon = () => <Download size={18} />;