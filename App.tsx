import React, { useState } from 'react';
import { UploadedFile, GenerationStatus, Rect } from './types';
import { generateCampaignImage, generateCampaignVideo } from './services/geminiService';
import { UploadZone } from './components/UploadZone';
import { GoogleProductSelector } from './components/GoogleProductSelector';
import { UserIcon, ProductIcon, MagicIcon, PhotoIcon, VideoIcon, Spinner, PlayIcon, ErrorIcon, ZoomIcon, CloseIcon, DownloadIcon } from './components/Icons';
import { Connector } from './components/Connector';
import { DraggableCard } from './components/DraggableCard';

// Initial Layout Configuration
const INITIAL_LAYOUT: Record<string, Rect> = {
    customer: { x: 50, y: 50, w: 320, h: 320 },
    product: { x: 50, y: 450, w: 320, h: 370 },
    prompt: { x: 450, y: 250, w: 384, h: 400 },
    startFrame: { x: 920, y: 250, w: 320, h: 500 },
    videoPrompt: { x: 1320, y: 250, w: 384, h: 350 },
    videoAd: { x: 1800, y: 250, w: 400, h: 500 },
};

const App = () => {
    // --- State ---
    const [layout, setLayout] = useState<Record<string, Rect>>(INITIAL_LAYOUT);
    
    // Input State
    const [customer, setCustomer] = useState<UploadedFile | null>(null);
    const [product, setProduct] = useState<UploadedFile | null>(null);
    const [prompt, setPrompt] = useState("High-end UGC perfume campaign. Model holding product in warm, minimalist interior. Soft golden light, high-end beauty photography aesthetic.");
    const [videoPrompt, setVideoPrompt] = useState("Cinematic slow motion, high end advertisement, 4k resolution, photorealistic.");

    // Generation State
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imgStatus, setImgStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
    
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [vidStatus, setVidStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);

    // Error State
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // UI State
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // --- Handlers ---
    
    const handleLayoutUpdate = (id: string, newRect: Rect) => {
        setLayout(prev => ({
            ...prev,
            [id]: newRect
        }));
    };

    const handleCustomerUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setCustomer({ file, previewUrl: url });
    };

    const handleProductUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setProduct({ file, previewUrl: url });
    };

    // Helper to extract a friendly error message
    const getFriendlyErrorMessage = (error: any): string => {
        let msg = error instanceof Error ? error.message : String(error);
        
        // Detect Quota issues
        if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
            return "Quota exceeded. Please check your API billing details.";
        }

        // Clean up JSON error objects if they leak into the message string
        if (msg.includes('{"error":')) {
            try {
                // Attempt to find and parse the JSON part
                const match = msg.match(/\{"error":.*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    return parsed.error.message || msg;
                }
            } catch (e) {
                // Fallback if parsing fails
            }
        }
        
        return msg.length > 150 ? msg.substring(0, 150) + "..." : msg;
    };

    const handleGenerateImage = async () => {
        if (!customer || !product) return;
        
        setImgStatus(GenerationStatus.LOADING);
        setErrorMsg(null);
        
        try {
            const resultUrl = await generateCampaignImage(customer.file, product.file, prompt);
            setGeneratedImage(resultUrl);
            setImgStatus(GenerationStatus.SUCCESS);
            setGeneratedVideo(null);
            setVidStatus(GenerationStatus.IDLE);
        } catch (e) {
            console.error(e);
            setImgStatus(GenerationStatus.ERROR);
            setErrorMsg(getFriendlyErrorMessage(e));
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage) return;

        setVidStatus(GenerationStatus.LOADING);
        setErrorMsg(null);

        try {
            const videoUrl = await generateCampaignVideo(generatedImage, videoPrompt);
            setGeneratedVideo(videoUrl);
            setVidStatus(GenerationStatus.SUCCESS);
        } catch (e) {
            console.error(e);
            setVidStatus(GenerationStatus.ERROR);
            setErrorMsg(getFriendlyErrorMessage(e));
        }
    };

    // --- Helper to get connection points ---
    // Returns Right-Center for source, Left-Center for target
    const getConnection = (sourceId: string, targetId: string) => {
        const s = layout[sourceId];
        const t = layout[targetId];
        return {
            start: { x: s.x + s.w, y: s.y + (s.h / 2) },
            end: { x: t.x, y: t.y + (t.h / 2) }
        };
    };

    return (
        <div className="w-screen h-screen overflow-auto bg-dots">
            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <CloseIcon />
                    </button>
                    <img 
                        src={lightboxImage} 
                        alt="Full View" 
                        className="max-w-full max-h-full object-contain rounded shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* Infinite Canvas Area */}
            <div className="relative w-[2500px] h-[1500px]">
                
                {/* --- Connectors Layer --- */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Connector {...getConnection('customer', 'prompt')} />
                    <Connector {...getConnection('product', 'prompt')} />
                    <Connector {...getConnection('prompt', 'startFrame')} />
                    <Connector {...getConnection('startFrame', 'videoPrompt')} />
                    <Connector {...getConnection('videoPrompt', 'videoAd')} />
                </div>

                {/* --- Draggable Cards --- */}

                {/* 1. Customer Input */}
                <DraggableCard 
                    id="customer" 
                    rect={layout.customer} 
                    onUpdate={handleLayoutUpdate}
                    title="YOUR CUSTOMER"
                    icon={<UserIcon />}
                >
                    <UploadZone 
                        label="Drop customer photo" 
                        onFileSelect={handleCustomerUpload} 
                        previewUrl={customer?.previewUrl ?? null}
                    />
                </DraggableCard>

                {/* 2. Product Input */}
                <DraggableCard 
                    id="product" 
                    rect={layout.product} 
                    onUpdate={handleLayoutUpdate}
                    title="GOOGLE"
                    icon={<ProductIcon />}
                >
                    <GoogleProductSelector 
                        onFileSelect={handleProductUpload} 
                        previewUrl={product?.previewUrl ?? null}
                    />
                </DraggableCard>

                {/* 3. Image Prompt */}
                <DraggableCard 
                    id="prompt" 
                    rect={layout.prompt} 
                    onUpdate={handleLayoutUpdate}
                    title="IMAGE PROMPT"
                    icon={<MagicIcon />}
                >
                    <div className="flex flex-col h-full gap-4">
                        <textarea 
                            className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none resize-none transition-all"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the ad context..."
                        />
                        <button 
                            onClick={handleGenerateImage}
                            disabled={!customer || !product || imgStatus === GenerationStatus.LOADING}
                            className={`w-full py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2
                                ${(!customer || !product) 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:scale-[1.02]'}`}
                        >
                            {imgStatus === GenerationStatus.LOADING ? <><Spinner /><span>Generating...</span></> : <><MagicIcon /><span>Generate Image</span></>}
                        </button>
                    </div>
                </DraggableCard>

                {/* 4. Start Frame */}
                <DraggableCard 
                    id="startFrame" 
                    rect={layout.startFrame} 
                    onUpdate={handleLayoutUpdate}
                    title="START FRAME"
                    icon={<PhotoIcon />}
                >
                    {imgStatus === GenerationStatus.ERROR ? (
                         <div className="flex-1 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center h-full p-6 text-center">
                            <ErrorIcon />
                            <p className="text-red-600 text-xs font-medium mt-3 mb-4 leading-relaxed">{errorMsg}</p>
                            <button 
                                onClick={handleGenerateImage}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : generatedImage ? (
                        <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50 w-full h-full relative group">
                            <img 
                                src={generatedImage} 
                                alt="Generated" 
                                className="w-full h-full object-contain cursor-pointer" 
                                onClick={() => setLightboxImage(generatedImage)}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxImage(generatedImage);
                                    }}
                                    className="bg-white/90 p-2 rounded-lg shadow-sm hover:scale-110 text-slate-600 hover:text-pink-500 transition-all"
                                    title="View Fullscreen"
                                >
                                    <ZoomIcon />
                                </button>
                                <a 
                                    href={generatedImage} 
                                    download="campaign_image.png" 
                                    className="bg-white/90 p-2 rounded-lg shadow-sm hover:scale-110 block text-slate-600 hover:text-pink-500 transition-all"
                                    title="Download"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DownloadIcon />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center h-full">
                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2"><PhotoIcon /></div>
                                <p className="text-slate-400 text-xs">Waiting for generation...</p>
                            </div>
                        </div>
                    )}
                </DraggableCard>

                {/* 5. Video Prompt */}
                <DraggableCard 
                    id="videoPrompt" 
                    rect={layout.videoPrompt} 
                    onUpdate={handleLayoutUpdate}
                    title="VIDEO PROMPT"
                    icon={<MagicIcon />}
                >
                    <div className="flex flex-col h-full gap-4">
                        <textarea 
                            className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none resize-none transition-all"
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                            placeholder="Describe motion..."
                        />
                        <button 
                            onClick={handleGenerateVideo}
                            disabled={!generatedImage || vidStatus === GenerationStatus.LOADING}
                            className={`w-full py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2
                                ${!generatedImage ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900 hover:scale-[1.02]'}`}
                        >
                            {vidStatus === GenerationStatus.LOADING ? <><Spinner /><span>Animating...</span></> : <><PlayIcon /><span>Animate Video</span></>}
                        </button>
                    </div>
                </DraggableCard>

                {/* 6. Video Ad */}
                <DraggableCard 
                    id="videoAd" 
                    rect={layout.videoAd} 
                    onUpdate={handleLayoutUpdate}
                    title="VIDEO AD"
                    icon={<VideoIcon />}
                >
                    {vidStatus === GenerationStatus.ERROR ? (
                        <div className="flex-1 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center h-full p-6 text-center">
                            <ErrorIcon />
                            <p className="text-red-600 text-xs font-medium mt-3 mb-4 leading-relaxed">{errorMsg}</p>
                            <button 
                                onClick={handleGenerateVideo}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : generatedVideo ? (
                        <div className="bg-slate-900 rounded-xl overflow-hidden relative shadow-lg w-full h-full">
                            <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center h-full">
                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2"><VideoIcon /></div>
                                <p className="text-slate-500 text-xs">Video will appear here</p>
                            </div>
                        </div>
                    )}
                </DraggableCard>

            </div>
        </div>
    );
};

export default App;