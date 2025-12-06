import { useEffect, useState } from 'react';

interface IceShape {
  id: number;
  type: 'cube' | 'diamond' | 'hexagon' | 'crystal';
  size: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  duration: number;
}

const generateShapes = (): IceShape[] => {
  const shapes: IceShape[] = [];
  const types: IceShape['type'][] = ['cube', 'diamond', 'hexagon', 'crystal'];
  
  for (let i = 0; i < 12; i++) {
    shapes.push({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      size: Math.random() * 40 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      delay: Math.random() * 8,
      duration: Math.random() * 15 + 20,
    });
  }
  return shapes;
};

const IceCube = ({ size, style }: { size: number; style: React.CSSProperties }) => (
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
        background: 'linear-gradient(135deg, rgba(161, 196, 255, 0.3) 0%, rgba(199, 211, 255, 0.15) 50%, rgba(233, 242, 255, 0.25) 100%)',
        border: '1px solid rgba(161, 196, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        boxShadow: `
          0 4px 16px rgba(77, 139, 255, 0.15),
          inset 0 1px 2px rgba(255, 255, 255, 0.4),
          inset 0 -1px 2px rgba(77, 139, 255, 0.1)
        `,
      }}
    />
  </div>
);

const Diamond = ({ size, style }: { size: number; style: React.CSSProperties }) => (
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
        background: 'linear-gradient(135deg, rgba(77, 139, 255, 0.25) 0%, rgba(161, 196, 255, 0.2) 50%, rgba(233, 242, 255, 0.3) 100%)',
        border: '1px solid rgba(161, 196, 255, 0.5)',
        backdropFilter: 'blur(6px)',
        transform: 'rotate(45deg)',
        boxShadow: `
          0 6px 20px rgba(77, 139, 255, 0.2),
          inset 0 2px 4px rgba(255, 255, 255, 0.5)
        `,
      }}
    />
  </div>
);

const Hexagon = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size,
      height: size * 1.15,
    }}
  >
    <svg viewBox="0 0 100 115" className="w-full h-full">
      <defs>
        <linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(161, 196, 255, 0.35)" />
          <stop offset="50%" stopColor="rgba(199, 211, 255, 0.2)" />
          <stop offset="100%" stopColor="rgba(233, 242, 255, 0.3)" />
        </linearGradient>
        <filter id="iceBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <polygon
        points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75"
        fill="url(#iceGradient)"
        stroke="rgba(161, 196, 255, 0.5)"
        strokeWidth="1"
        filter="url(#iceBlur)"
      />
    </svg>
  </div>
);

const Crystal = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <div
    className="absolute"
    style={{
      ...style,
      width: size * 0.6,
      height: size,
    }}
  >
    <svg viewBox="0 0 60 100" className="w-full h-full">
      <defs>
        <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(77, 139, 255, 0.3)" />
          <stop offset="30%" stopColor="rgba(161, 196, 255, 0.25)" />
          <stop offset="70%" stopColor="rgba(199, 211, 255, 0.2)" />
          <stop offset="100%" stopColor="rgba(233, 242, 255, 0.35)" />
        </linearGradient>
      </defs>
      <polygon
        points="30,0 60,35 45,100 15,100 0,35"
        fill="url(#crystalGradient)"
        stroke="rgba(161, 196, 255, 0.6)"
        strokeWidth="1"
      />
      <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
      <line x1="0" y1="35" x2="60" y2="35" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
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
      animation: `ice-float-${shape.id % 4} ${shape.duration}s ease-in-out infinite`,
      animationDelay: `${shape.delay}s`,
      opacity: isLoaded ? 1 : 0,
      transition: `opacity 1.5s ease-out ${shape.delay * 0.1}s`,
    };

    switch (shape.type) {
      case 'cube':
        return <IceCube key={shape.id} size={shape.size} style={baseStyle} />;
      case 'diamond':
        return <Diamond key={shape.id} size={shape.size} style={baseStyle} />;
      case 'hexagon':
        return <Hexagon key={shape.id} size={shape.size} style={baseStyle} />;
      case 'crystal':
        return <Crystal key={shape.id} size={shape.size} style={baseStyle} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 -z-5 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Floating ice shapes */}
      {shapes.map(renderShape)}
      
      {/* Additional sparkle particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 3) * 25}%`,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(161, 196, 255, 0.4) 50%, transparent 100%)',
            animation: `sparkle ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            boxShadow: '0 0 8px rgba(161, 196, 255, 0.6)',
          }}
        />
      ))}
    </div>
  );
};
