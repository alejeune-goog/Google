import { GoogleGenAI } from "@google/genai";

// Helper to convert Blob/File to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Generates an image using Gemini 2.5 Flash Image ("Nano Banana")
 * combining customer image, product image, and a text prompt.
 */
export const generateCampaignImage = async (
    customerFile: File,
    productFile: File,
    prompt: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const customerB64 = await blobToBase64(customerFile);
    const productB64 = await blobToBase64(productFile);

    // Fallback MIME types to ensure API compatibility
    const custMime = customerFile.type || "image/jpeg";
    const prodMime = productFile.type || "image/jpeg";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: custMime,
                            data: customerB64
                        }
                    },
                    {
                        inlineData: {
                            mimeType: prodMime,
                            data: productB64
                        }
                    },
                    {
                        text: "Create a high-end photorealistic image combining this two images. " + prompt
                    }
                ]
            }
        });

        // Parse response for image with extremely safe optional chaining
        // This prevents the "Cannot read properties of undefined (reading 'parts')" error
        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts;

        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const mimeType = part.inlineData.mimeType || "image/png";
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        // If we get here, the model likely refused the prompt due to safety settings
        console.warn("Gemini Response (No Image):", response);
        throw new Error("No image generated. The model may have filtered the response due to safety policies.");

    } catch (error) {
        console.error("Image Generation Error:", error);
        throw error;
    }
};

/**
 * Generates a video using Veo 3.1
 * Takes a starting image and animates it.
 */
export const generateCampaignVideo = async (
    startImageBase64: string,
    prompt: string = "Cinematic slow motion, high end advertisement"
): Promise<string> => {
    
    // Veo requires explicit key selection
    // Using explicit casting to handle window.aistudio without global type augmentation
    const aistudio = (window as any).aistudio;
    if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await aistudio.openSelectKey();
        }
    }

    // Re-instantiate with potentially updated key context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract mime type from data URL if present
    let mimeType = 'image/png';
    if (startImageBase64.startsWith('data:')) {
        const matches = startImageBase64.match(/^data:([^;]+);/);
        if (matches && matches[1]) {
            mimeType = matches[1];
        }
    }

    // Clean base64 string if it has headers
    const cleanBase64 = startImageBase64.includes('base64,') 
        ? startImageBase64.split('base64,')[1] 
        : startImageBase64;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: cleanBase64,
                mimeType: mimeType
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling loop
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!downloadLink) throw new Error("No video URI returned");

        // Fetch the actual video bytes
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Video Generation Error:", error);
        throw error;
    }
};