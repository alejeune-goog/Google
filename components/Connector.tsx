import React from 'react';

interface ConnectorProps {
    start: { x: number; y: number };
    end: { x: number; y: number };
}

/**
 * Draws a smooth bezier curve between two absolute points on the canvas.
 */
export const Connector: React.FC<ConnectorProps> = ({ start, end }) => {
    // Control points for bezier curve to make it "S" shaped
    // We adjust the curvature based on the distance
    const dist = Math.abs(end.x - start.x);
    const controlOffset = Math.max(dist * 0.5, 50);

    const cp1x = start.x + controlOffset;
    const cp1y = start.y;
    const cp2x = end.x - controlOffset;
    const cp2y = end.y;

    const path = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
            <path 
                d={path} 
                fill="none" 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeLinecap="round"
            />
            {/* Moving dot animation */}
            <circle r="3" fill="#FF4081">
                <animateMotion dur="2s" repeatCount="indefinite" path={path} calcMode="linear" />
            </circle>
        </svg>
    );
};