import { useEffect, useState } from 'react';

export const GradientMeshBackground = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entry animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 -z-10 overflow-hidden pointer-events-none
        transition-all duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
        ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'}
      `}
      aria-hidden="true"
    >
      {/* Gradient Mesh Layer - Light Mode */}
      <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-500">
        {/* Primary mesh layers using brand colors */}
        <div 
          className="absolute inset-0 animate-mesh-drift-1"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 15% 20%, rgba(77, 139, 255, 0.12) 0%, transparent 55%),
              radial-gradient(ellipse 70% 80% at 85% 30%, rgba(161, 196, 255, 0.10) 0%, transparent 50%),
              radial-gradient(ellipse 90% 70% at 50% 80%, rgba(199, 211, 255, 0.11) 0%, transparent 55%),
              radial-gradient(ellipse 60% 90% at 20% 70%, rgba(233, 242, 255, 0.09) 0%, transparent 45%),
              radial-gradient(ellipse 75% 65% at 75% 75%, rgba(77, 139, 255, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 85% 75% at 40% 40%, rgba(161, 196, 255, 0.07) 0%, transparent 60%)
            `,
            filter: 'blur(120px)',
          }}
        />
        
        {/* Secondary floating layer */}
        <div 
          className="absolute inset-0 animate-mesh-drift-2"
          style={{
            background: `
              radial-gradient(ellipse 65% 85% at 70% 15%, rgba(199, 211, 255, 0.09) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 30% 55%, rgba(77, 139, 255, 0.07) 0%, transparent 55%),
              radial-gradient(ellipse 70% 70% at 60% 90%, rgba(233, 242, 255, 0.10) 0%, transparent 45%),
              radial-gradient(ellipse 55% 75% at 90% 60%, rgba(161, 196, 255, 0.08) 0%, transparent 50%)
            `,
            filter: 'blur(140px)',
          }}
        />
        
        {/* Tertiary subtle accent layer */}
        <div 
          className="absolute inset-0 animate-mesh-drift-3"
          style={{
            background: `
              radial-gradient(ellipse 90% 50% at 10% 50%, rgba(77, 139, 255, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 50% 80% at 95% 40%, rgba(199, 211, 255, 0.08) 0%, transparent 50%)
            `,
            filter: 'blur(160px)',
          }}
        />
      </div>

      {/* Gradient Mesh Layer - Dark Mode (30% darker colors) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
        {/* Primary mesh layers - darkened brand colors */}
        <div 
          className="absolute inset-0 animate-mesh-drift-1"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 15% 20%, rgba(54, 97, 179, 0.09) 0%, transparent 55%),
              radial-gradient(ellipse 70% 80% at 85% 30%, rgba(113, 137, 179, 0.07) 0%, transparent 50%),
              radial-gradient(ellipse 90% 70% at 50% 80%, rgba(139, 148, 179, 0.08) 0%, transparent 55%),
              radial-gradient(ellipse 60% 90% at 20% 70%, rgba(163, 169, 179, 0.06) 0%, transparent 45%),
              radial-gradient(ellipse 75% 65% at 75% 75%, rgba(54, 97, 179, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 85% 75% at 40% 40%, rgba(113, 137, 179, 0.05) 0%, transparent 60%)
            `,
            filter: 'blur(120px)',
          }}
        />
        
        {/* Secondary floating layer - dark */}
        <div 
          className="absolute inset-0 animate-mesh-drift-2"
          style={{
            background: `
              radial-gradient(ellipse 65% 85% at 70% 15%, rgba(139, 148, 179, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 30% 55%, rgba(54, 97, 179, 0.05) 0%, transparent 55%),
              radial-gradient(ellipse 70% 70% at 60% 90%, rgba(163, 169, 179, 0.07) 0%, transparent 45%),
              radial-gradient(ellipse 55% 75% at 90% 60%, rgba(113, 137, 179, 0.06) 0%, transparent 50%)
            `,
            filter: 'blur(140px)',
          }}
        />
        
        {/* Tertiary subtle accent layer - dark */}
        <div 
          className="absolute inset-0 animate-mesh-drift-3"
          style={{
            background: `
              radial-gradient(ellipse 90% 50% at 10% 50%, rgba(54, 97, 179, 0.04) 0%, transparent 60%),
              radial-gradient(ellipse 50% 80% at 95% 40%, rgba(139, 148, 179, 0.05) 0%, transparent 50%)
            `,
            filter: 'blur(160px)',
          }}
        />
      </div>
    </div>
  );
};
