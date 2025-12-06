import { useEffect, useState } from 'react';

interface IceShape {
  id: number;
  type: 'cube' | 'diamond' | 'hexagon' | 'crystal' | 'circle' | 'triangle' | 'star';
  size: number;
  x: number;
  y: number;
  delay: number;
  color: 'blue' | 'purple' | 'cyan' | 'pink';
}

// Grid-based placement to prevent overlapping
const generateShapes = (): IceShape[] => {
  const shapes: IceShape[] = [];
  const types: IceShape['type'][] = ['cube', 'diamond', 'hexagon', 'crystal', 'circle', 'triangle', 'star'];
  const colors: IceShape['color'][] = ['blue', 'purple', 'cyan', 'pink'];
  
  // Create a 5x8 grid for even distribution across longer pages
  const gridCols = 5;
  const gridRows = 8;
  const cellWidth = 100 / gridCols;
  const cellHeight = 100 / gridRows;
  
  let index = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      // Skip some cells randomly for organic feel
      if (Math.random() > 0.6) continue;
      
      const x = col * cellWidth + cellWidth * 0.15 + Math.random() * cellWidth * 0.5;
      const y = row * cellHeight + cellHeight * 0.15 + Math.random() * cellHeight * 0.5;
      
      shapes.push({
        id: index,
        type: types[Math.floor(Math.random() * types.length)],
        size: 16 + Math.random() * 24, // 16-40px - smaller for subtlety
        x,
        y,
        delay: Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      index++;
    }
  }
  return shapes;
};

const getColorGradient = (color: IceShape['color']) => {
  switch (color) {
    case 'blue':
      return 'rgba(77, 139, 255, 0.12), rgba(161, 196, 255, 0.08)';
    case 'purple':
      return 'rgba(167, 139, 250, 0.12), rgba(199, 211, 255, 0.08)';
    case 'cyan':
      return 'rgba(34, 211, 238, 0.12), rgba(161, 196, 255, 0.08)';
    case 'pink':
      return 'rgba(244, 114, 182, 0.10), rgba(199, 211, 255, 0.06)';
  }
};

const getBorderColor = (color: IceShape['color']) => {
  switch (color) {
    case 'blue':
      return 'rgba(77, 139, 255, 0.2)';
    case 'purple':
      return 'rgba(167, 139, 250, 0.2)';
    case 'cyan':
      return 'rgba(34, 211, 238, 0.2)';
    case 'pink':
      return 'rgba(244, 114, 182, 0.18)';
  }
};

const IceCube = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size }}>
    <div
      className="w-full h-full rounded-md"
      style={{
        background: `linear-gradient(135deg, ${getColorGradient(color)})`,
        border: `1px solid ${getBorderColor(color)}`,
      }}
    />
  </div>
);

const Diamond = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size }}>
    <div
      className="w-full h-full"
      style={{
        background: `linear-gradient(135deg, ${getColorGradient(color)})`,
        border: `1px solid ${getBorderColor(color)}`,
        transform: 'rotate(45deg)',
      }}
    />
  </div>
);

const Circle = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size }}>
    <div
      className="w-full h-full rounded-full"
      style={{
        background: `linear-gradient(135deg, ${getColorGradient(color)})`,
        border: `1px solid ${getBorderColor(color)}`,
      }}
    />
  </div>
);

const Hexagon = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size * 1.15 }}>
    <svg viewBox="0 0 100 115" className="w-full h-full">
      <polygon
        points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75"
        fill={`rgba(${color === 'blue' ? '77, 139, 255' : color === 'purple' ? '167, 139, 250' : color === 'cyan' ? '34, 211, 238' : '244, 114, 182'}, 0.1)`}
        stroke={getBorderColor(color)}
        strokeWidth="2"
      />
    </svg>
  </div>
);

const Triangle = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon
        points="50,5 95,95 5,95"
        fill={`rgba(${color === 'blue' ? '77, 139, 255' : color === 'purple' ? '167, 139, 250' : color === 'cyan' ? '34, 211, 238' : '244, 114, 182'}, 0.1)`}
        stroke={getBorderColor(color)}
        strokeWidth="2"
      />
    </svg>
  </div>
);

const Crystal = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size * 0.6, height: size }}>
    <svg viewBox="0 0 60 100" className="w-full h-full">
      <polygon
        points="30,0 60,35 45,100 15,100 0,35"
        fill={`rgba(${color === 'blue' ? '77, 139, 255' : color === 'purple' ? '167, 139, 250' : color === 'cyan' ? '34, 211, 238' : '244, 114, 182'}, 0.1)`}
        stroke={getBorderColor(color)}
        strokeWidth="2"
      />
    </svg>
  </div>
);

const Star = ({ size, style, color }: { size: number; style: React.CSSProperties; color: IceShape['color'] }) => (
  <div className="absolute" style={{ ...style, width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon
        points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
        fill={`rgba(${color === 'blue' ? '77, 139, 255' : color === 'purple' ? '167, 139, 250' : color === 'cyan' ? '34, 211, 238' : '244, 114, 182'}, 0.08)`}
        stroke={getBorderColor(color)}
        strokeWidth="1.5"
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
      opacity: isLoaded ? 0.7 : 0,
      transition: `opacity 2s ease-out ${shape.delay * 0.15}s`,
    };

    const props = { size: shape.size, style: baseStyle, color: shape.color };

    switch (shape.type) {
      case 'cube':
        return <IceCube key={shape.id} {...props} />;
      case 'diamond':
        return <Diamond key={shape.id} {...props} />;
      case 'circle':
        return <Circle key={shape.id} {...props} />;
      case 'hexagon':
        return <Hexagon key={shape.id} {...props} />;
      case 'triangle':
        return <Triangle key={shape.id} {...props} />;
      case 'crystal':
        return <Crystal key={shape.id} {...props} />;
      case 'star':
        return <Star key={shape.id} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {shapes.map(renderShape)}
    </div>
  );
};
