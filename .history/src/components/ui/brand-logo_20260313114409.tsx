import { useState } from "react";

interface BrandLogoProps {
  src: string;
  name: string;
  className?: string;
}

const gradients = [
  "from-emerald-600 to-teal-800",
  "from-violet-600 to-purple-800",
  "from-sky-600 to-blue-800",
  "from-amber-600 to-orange-800",
  "from-rose-600 to-pink-800",
  "from-indigo-600 to-blue-900",
  "from-cyan-600 to-teal-900",
  "from-fuchsia-600 to-purple-900",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function BrandLogo({ src, name, className = "" }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold text-xl select-none`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
