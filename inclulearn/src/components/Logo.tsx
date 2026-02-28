export default function Logo({ className = "w-10 h-10", color = "currentColor" }: { className?: string, color?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="EduAble Logo"
        >
            {/* Star */}
            <path d="M315 130 L323 155 L350 155 L328 170 L336 195 L315 180 L293 195 L301 170 L279 155 L306 155 Z" fill={color} />

            {/* Head */}
            <circle cx="260" cy="180" r="24" fill={color} />

            {/* Body and Arm */}
            <path d="M250 250 Q280 230 310 180" stroke={color} strokeWidth="26" strokeLinecap="round" fill="none" />

            {/* Wheel */}
            <circle cx="230" cy="300" r="50" stroke={color} strokeWidth="30" fill="none" />

            {/* Leg */}
            <path d="M245 250 L255 285 Q265 315 295 320 L325 320" stroke={color} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Book Bottom Outline */}
            <path d="M120 280 L120 330 Q200 350 250 310" stroke={color} strokeWidth="26" strokeLinecap="round" fill="none" />
            <path d="M380 280 L380 330 Q300 350 250 310" stroke={color} strokeWidth="26" strokeLinecap="round" fill="none" />

            {/* Book Inner Outline */}
            <path d="M150 180 L150 270 Q200 290 250 250" stroke={color} strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M350 180 L350 270 Q300 290 250 250" stroke={color} strokeWidth="22" strokeLinecap="round" fill="none" />
        </svg>
    );
}
