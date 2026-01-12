"use client";

import "../css/logo.css";

const MantleLogo = () => {
    return (
        <svg
            width="512"
            height="512"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
        >
            <defs>
                {/* ========= GRADIENT STROKE ========= */}
                <linearGradient
                    id="mantleStroke"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#5ac2b5" />
                    <stop offset="50%" stopColor="#4a9d95" />
                    <stop offset="100%" stopColor="#0b3d3d" />
                </linearGradient>

                {/* ========= SPOKES ========= */}
                <polygon
                    id="outerSpoke"
                    points="240 0 272 0 268 85 244 85"
                />
                <polygon
                    id="innerSpoke"
                    points="235 84 273 84 264 172 248 172"
                />
            </defs>

            {/* ========= OUTER SPOKES ========= */}
            <g
                fill="#4a9d95"
                stroke="url(#mantleStroke)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <use
                        key={i}
                        href="#outerSpoke"
                        transform={`rotate(${i * 18} 256 256)`}
                        className={`outer-spoke-${i}`}
                    />
                ))}
            </g>

            {/* ========= INNER SPOKES ========= */}
            <g
                fill="#3d7a75"
                stroke="url(#mantleStroke)"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
            >
                {Array.from({ length: 12 }).map((_, i) => (
                    <use
                        key={i}
                        href="#innerSpoke"
                        transform={`rotate(${15 + i * 30} 256 256)`}
                        className={`inner-spoke-${i}`}
                    />
                ))}
            </g>

            {/* ========= CENTER ICON ========= */}
            <g
                className="center-icon-wrapper"
                style={{ "--rotation": "-360deg" } as React.CSSProperties}
            >
                <g transform="translate(196 196) scale(5)">
                    <path
                        d="M7 3H3v4h4V3zm0 14H3v4h4v-4zM17 3h4v4h-4V3zm4 14h-4v4h4v-4zM8 8h2v2H8V8zm4 2h-2v4H8v2h2v-2h4v2h2v-2h-2v-4h2V8h-2v2h-2z"
                        fill="#2d5a57"
                        stroke="url(#mantleStroke)"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                    />
                </g>

            </g>
        </svg>
    );
};

export default MantleLogo;
