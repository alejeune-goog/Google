import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Rect } from '../types';
import { Card } from './Card';

interface DraggableCardProps {
    id: string;
    rect: Rect;
    onUpdate: (id: string, newRect: Rect) => void;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ 
    id, 
    rect, 
    onUpdate, 
    title, 
    icon, 
    children 
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const dragControls = useDragControls();
    
    // Track start values for delta calculation
    const resizeStart = useRef<{ x: number, y: number, w: number, h: number } | null>(null);

    const onPointerDown = (e: React.PointerEvent) => {
        // Prevent default browser behaviors and event propagation
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(true);
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            w: rect.w,
            h: rect.h
        };
        
        // Critical: Capture the pointer. This ensures this element receives 
        // all future pointer events (move/up) even if the cursor leaves the element.
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        // Only resize if we are in the resizing state
        if (!isResizing || !resizeStart.current) return;
        
        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;

        const newW = Math.max(250, resizeStart.current.w + dx);
        const newH = Math.max(200, resizeStart.current.h + dy);

        onUpdate(id, { ...rect, w: newW, h: newH });
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!isResizing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(false);
        resizeStart.current = null;
        
        // Release the capture
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    return (
        <motion.div
            drag={!isResizing} // Disable card dragging logic while resizing logic is active
            dragListener={false} // Disable starting drag from anywhere on the card
            dragControls={dragControls} // Enable starting drag programmatically (via header)
            dragMomentum={false}
            onDrag={(e, info) => {
                if (!isResizing) {
                    onUpdate(id, { 
                        ...rect, 
                        x: rect.x + info.delta.x, 
                        y: rect.y + info.delta.y 
                    });
                }
            }}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                x: rect.x,
                y: rect.y,
                width: rect.w,
                height: rect.h,
                zIndex: isResizing ? 50 : 10
            }}
            className="group"
        >
            <Card 
                title={title} 
                icon={icon} 
                className="w-full h-full" 
                dragControls={dragControls}
            >
                {children}
            </Card>

            {/* Resize Handle - Uses Pointer Events directly on the element */}
            <div 
                className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize z-50 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp} // Safety fallback
            >
                <div className="w-3 h-3 bg-slate-300 rounded-br-sm group-hover:bg-pink-400 transition-colors" />
            </div>
        </motion.div>
    );
};