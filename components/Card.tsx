import React from 'react';
import { motion, DragControls } from 'framer-motion';

interface CardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    id?: string;
    dragControls?: DragControls;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = "", id, dragControls }) => {
    return (
        <motion.div 
            id={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`bg-white rounded-2xl shadow-xl border border-slate-100 p-5 flex flex-col relative z-10 ${className}`}
        >
            <div 
                className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
                onPointerDown={(e) => dragControls?.start(e)}
            >
                <div className="bg-pink-50 p-1.5 rounded-lg pointer-events-none">
                    {icon}
                </div>
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase pointer-events-none">{title}</h3>
            </div>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </motion.div>
    );
};