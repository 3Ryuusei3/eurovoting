import React from 'react';

interface MaskedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function MaskedImage({ src, alt, className = '' }: MaskedImageProps) {
  return (
    <div className={`relative inline-block w-[40px] h-[38px] ${className}`}>
      <svg
        style={{ position: 'absolute', width: 0, height: 0 }}
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 40 38"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMorphology operator="dilate" radius="0.1" in="blur" result="glow" />
            <feFlood floodColor="black" result="color" />
            <feComposite in="color" in2="glow" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id="eurovision-mask">
            <path
              fill="white"
              d="M30,0.2c-3.2,0-9,3.4-12,7.8c-0.8-1.7-3.6-3.4-7-3.4S0,7.7,0,19.3s14.3,15.3,17.1,19.4c0.2,0.3,0.9,0.5,1.1-0.2c2.4-6.5,21.8-13.6,21.8-25.9S30,0.2,30,0.2z"
            />
          </mask>
        </defs>
      </svg>
      <div
        style={{
          WebkitMaskImage: 'url(#eurovision-mask)',
          maskImage: 'url(#eurovision-mask)',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      <svg
        className="absolute top-0 left-0"
        viewBox="0 0 21.3 22.3"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          fill="#ffffff"
          filter="url(#glow)"
          d="M16,0.1c-1.7,0-4.8,2-6.4,4.6c-0.4-1-1.9-2-3.7-2s-5.5,1.8-5.5,7.6s7.6,9,9.1,11.4c0.1,0.2,0.5,0.3,0.6-0.1C11.4,18,20.9,14,20.9,6.6S16,0.1,16,0.1z M18.3,6.5c-0.2,5.9-7.7,10.5-8.6,13.4c-0.9-1.8-7.2-4.3-7.1-10c0-4.6,2.5-6.1,3.7-6.1s2.6,1.4,2.7,2C9.1,6.4,9.8,7,10,5.9c0.2-1.1,2.4-4.1,5.1-4.1S18.4,4.3,18.3,6.5L18.3,6.5z"
        />
      </svg>
    </div>
  );
}
