import { useEffect, useState } from 'react';

interface IceShape {
  id: number;
  type: 'cube' | 'diamond' | 'hexagon' | 'crystal';
  size: number;
  x: number;
  y: number;
  delay: number;
}

// Grid-based placement to prevent overlapping
const generateShapes = (): IceShape[] => {
  const shapes: IceShape[] = [];
  const types: IceShape['type'][] = ['cube', 'diamond', 'hexagon', 'crystal'];
  
  // Create a 4x3 grid for even distribution
  const gridCols = 4;
  const gridRows = 3;
  const cellWidth = 100 / gridCols;
  const cellHeight = 100 / gridRows;
  
  let index = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      // Place shape within cell with some padding
      const x = col * cellWidth + cellWidth * 0.2 + Math.random() * cellWidth * 0.4;
      const y = row * cellHeight + cellHeight * 0.2 + Math.random() * cellHeight * 0.4;
      
      shapes.push({
        id: index,
        type: types[index % types.length],
        size: 28 + Math.random() * 20, // 28-48px
        x,
        y,
        delay: index * 0.5,
      });
      index++;
    }
  }
  return shapes;
};

const IceCube = ({ size, style, delay }: { size: number; style: React.CSSProperties; delay: number }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size,
      height: size,
    }}
  >
    <div
      className="w-full h-full rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(161, 196, 255, 0.25) 0%, rgba(199, 211, 255, 0.15) 50%, rgba(233, 242, 255, 0.2) 100%)',
        border: '1px solid rgba(161, 196, 255, 0.35)',
        backdropFilter: 'blur(8px)',
        boxShadow: `
          0 4px 16px rgba(77, 139, 255, 0.1),
          inset 0 1px 2px rgba(255, 255, 255, 0.3)
        `,
        animation: `ice-color-shift 8s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  </div>
);

const Diamond = ({ size, style, delay }: { size: number; style: React.CSSProperties; delay: number }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size,
      height: size,
    }}
  >
    <div
      className="w-full h-full"
      style={{
        background: 'linear-gradient(135deg, rgba(77, 139, 255, 0.2) 0%, rgba(161, 196, 255, 0.15) 50%, rgba(233, 242, 255, 0.25) 100%)',
        border: '1px solid rgba(161, 196, 255, 0.4)',
        backdropFilter: 'blur(6px)',
        transform: 'rotate(45deg)',
        boxShadow: `0 4px 16px rgba(77, 139, 255, 0.12)`,
        animation: `ice-color-shift 10s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  </div>
);

const Hexagon = ({ size, style, delay }: { size: number; style: React.CSSProperties; delay: number }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size,
      height: size * 1.15,
      animation: `ice-color-shift 9s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg viewBox="0 0 100 115" className="w-full h-full">
      <defs>
        <linearGradient id={`iceGradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(161, 196, 255, 0.3)">
            <animate attributeName="stop-color" 
              values="rgba(161, 196, 255, 0.3); rgba(199, 211, 255, 0.35); rgba(77, 139, 255, 0.25); rgba(161, 196, 255, 0.3)" 
              dur="9s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="rgba(199, 211, 255, 0.2)">
            <animate attributeName="stop-color" 
              values="rgba(199, 211, 255, 0.2); rgba(233, 242, 255, 0.25); rgba(161, 196, 255, 0.2); rgba(199, 211, 255, 0.2)" 
              dur="9s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="rgba(233, 242, 255, 0.25)">
            <animate attributeName="stop-color" 
              values="rgba(233, 242, 255, 0.25); rgba(77, 139, 255, 0.2); rgba(199, 211, 255, 0.3); rgba(233, 242, 255, 0.25)" 
              dur="9s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <polygon
        points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75"
        fill={`url(#iceGradient-${delay})`}
        stroke="rgba(161, 196, 255, 0.4)"
        strokeWidth="1"
      />
    </svg>
  </div>
);

const Crystal = ({ size, style, delay }: { size: number; style: React.CSSProperties; delay: number }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size * 0.6,
      height: size,
      animation: `ice-color-shift 11s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg viewBox="0 0 60 100" className="w-full h-full">
      <defs>
        <linearGradient id={`crystalGradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(77, 139, 255, 0.25)">
            <animate attributeName="stop-color" 
              values="rgba(77, 139, 255, 0.25); rgba(161, 196, 255, 0.3); rgba(199, 211, 255, 0.25); rgba(77, 139, 255, 0.25)" 
              dur="11s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="rgba(161, 196, 255, 0.2)">
            <animate attributeName="stop-color" 
              values="rgba(161, 196, 255, 0.2); rgba(233, 242, 255, 0.25); rgba(77, 139, 255, 0.2); rgba(161, 196, 255, 0.2)" 
              dur="11s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="rgba(233, 242, 255, 0.3)">
            <animate attributeName="stop-color" 
              values="rgba(233, 242, 255, 0.3); rgba(77, 139, 255, 0.25); rgba(161, 196, 255, 0.3); rgba(233, 242, 255, 0.3)" 
              dur="11s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <polygon
        points="30,0 60,35 45,100 15,100 0,35"
        fill={`url(#crystalGradient-${delay})`}
        stroke="rgba(161, 196, 255, 0.5)"
        strokeWidth="1"
      />
    </svg>
  </div>
);

export const FloatingIceShapes = () => {
  const [shapes, setShapes] = useState<IceShape[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setShapes(generateShapes());
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderShape = (shape: IceShape) => {
    const baseStyle: React.CSSProperties = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      opacity: isLoaded ? 1 : 0,
      transition: `opacity 1.5s ease-out ${shape.delay * 0.1}s`,
    };

    switch (shape.type) {
      case 'cube':
        return <IceCube key={shape.id} size={shape.size} style={baseStyle} delay={shape.delay} />;
      case 'diamond':
        return <Diamond key={shape.id} size={shape.size} style={baseStyle} delay={shape.delay} />;
      case 'hexagon':
        return <Hexagon key={shape.id} size={shape.size} style={baseStyle} delay={shape.delay} />;
      case 'crystal':
        return <Crystal key={shape.id} size={shape.size} style={baseStyle} delay={shape.delay} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes ice-color-shift {
          0%, 100% {
            filter: hue-rotate(0deg) brightness(1);
          }
          33% {
            filter: hue-rotate(10deg) brightness(1.05);
          }
          66% {
            filter: hue-rotate(-10deg) brightness(0.95);
          }
        }
      `}</style>
      <div
        className="fixed inset-0 -z-5 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {shapes.map(renderShape)}
      </div>
    </>
  );
};
