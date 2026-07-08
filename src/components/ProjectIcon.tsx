import React from "react";

interface ProjectIconProps {
  className?: string;
  size?: number;
}

export const ProjectIcon: React.FC<ProjectIconProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none ${className}`}
    >
      <defs>
        <radialGradient id="bgGradComp" cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#1e40af"/>
          <stop offset="35%" stopColor="#1e1b4b"/>
          <stop offset="75%" stopColor="#0f172a"/>
          <stop offset="100%" stopColor="#020617"/>
        </radialGradient>

        <linearGradient id="goldGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="50%" stopColor="#eab308"/>
          <stop offset="100%" stopColor="#ca8a04"/>
        </linearGradient>

        <radialGradient id="glowGradComp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity={1}/>
          <stop offset="30%" stopColor="#facc15" stopOpacity={0.8}/>
          <stop offset="60%" stopColor="#eab308" stopOpacity={0.3}/>
          <stop offset="100%" stopColor="#ca8a04" stopOpacity={0}/>
        </radialGradient>
      </defs>

      <rect width="480" height="480" x="16" y="16" rx="108" fill="url(#bgGradComp)" stroke="#1e293b" strokeWidth="4"/>

      <path
        d="M 90,320 C 60,200 150,90 256,90 C 370,90 440,190 410,290 C 380,390 280,430 200,410 C 130,390 90,320 110,260" 
        fill="none"
        stroke="url(#goldGradComp)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      
      <path
        d="M 130,220 C 150,130 240,110 310,140 C 380,170 390,260 340,330 C 290,400 180,380 150,310 C 130,260 160,200 220,190" 
        fill="none"
        stroke="url(#goldGradComp)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="10 6"
        opacity="0.5"
      />

      <circle cx="256" cy="270" r="140" fill="url(#glowGradComp)"/>

      <path d="M 256,55 Q 256,75 236,75 Q 256,75 256,95 Q 256,75 276,75 Q 256,75 256,55 Z" fill="#ffffff" opacity="0.9"/>
      <path d="M 120,110 Q 120,125 105,125 Q 120,125 120,140 Q 120,125 135,125 Q 120,125 120,110 Z" fill="#fef08a" opacity="0.8"/>
      <path d="M 380,110 Q 380,125 365,125 Q 380,125 380,140 Q 380,125 395,125 Q 380,125 380,110 Z" fill="#fef08a" opacity="0.8"/>
      <path d="M 120,380 Q 120,395 105,395 Q 120,395 120,410 Q 120,395 135,395 Q 120,395 120,380 Z" fill="#fef08a" opacity="0.8"/>
      <path d="M 380,380 Q 380,395 365,395 Q 380,395 380,410 Q 380,395 395,395 Q 380,395 380,380 Z" fill="#fef08a" opacity="0.8"/>

      <circle cx="190" cy="80" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="320" cy="80" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="90" cy="180" r="2.5" fill="#fef08a" opacity="0.6"/>
      <circle cx="430" cy="180" r="2.5" fill="#fef08a" opacity="0.6"/>
      <circle cx="80" cy="300" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="440" cy="300" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="200" cy="440" r="2.5" fill="#fef08a" opacity="0.8"/>
      <circle cx="310" cy="440" r="2.5" fill="#fef08a" opacity="0.8"/>

      <g transform="translate(0, 15)">
        <path d="M 256,325 C 295,302 345,310 395,330 L 405,210 C 355,190 305,182 256,205 C 207,182 157,190 107,210 L 117,330 C 167,310 217,302 256,325 Z" 
              fill="#451a03" stroke="#270f01" strokeWidth="4" strokeLinejoin="round"/>
        
        <path d="M 256,320 C 294,297 342,305 390,325 L 398,205 C 350,185 302,177 256,200 C 210,177 162,185 114,205 L 122,325 C 170,305 218,297 256,320 Z" 
              fill="#d97706" opacity="0.95"/>

        <path d="M 256,195 C 212,172 166,180 120,200 L 128,315 C 174,295 220,287 256,310 Z" 
              fill="#fef9c3" stroke="#b45309" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M 256,195 C 300,172 346,180 392,200 L 384,315 C 338,295 292,287 256,310 Z" 
              fill="#fef9c3" stroke="#b45309" strokeWidth="2" strokeLinejoin="round"/>

        <path d="M 256,195 L 256,310" stroke="#78350f" strokeWidth="3" strokeLinecap="round"/>

        <path d="M 145,225 C 165,216 190,210 215,218" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 143,242 C 163,233 188,227 218,234" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 146,259 C 166,250 191,244 221,250" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 148,276 C 168,267 193,261 223,267" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 152,293 C 172,284 197,278 221,283" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>

        <path d="M 297,218 C 322,210 347,216 367,225" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 294,234 C 319,227 344,233 369,242" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 291,250 C 316,244 341,250 366,259" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 289,267 C 314,261 339,267 364,276" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M 291,283 C 315,278 340,284 360,293" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>

        <path d="M 125,208 L 132,205 L 129,215" fill="none" stroke="#78350f" strokeWidth="1.5"/>
        <path d="M 387,208 L 380,205 L 383,215" fill="none" stroke="#78350f" strokeWidth="1.5"/>
        <path d="M 134,310 L 141,304 L 140,311" fill="none" stroke="#78350f" strokeWidth="1.5"/>
        <path d="M 378,310 L 371,304 L 372,311" fill="none" stroke="#78350f" strokeWidth="1.5"/>
      </g>

      <g transform="translate(256, 275)" opacity="0.95">
        <line x1="0" y1="-85" x2="0" y2="70" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-80" y1="0" x2="80" y2="0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-50" y1="-50" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="50" y1="-50" x2="-50" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="0" cy="0" r="14" fill="#ffffff" />
      </g>
    </svg>
  );
};
