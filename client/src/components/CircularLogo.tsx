import type { DesignSettings } from "@shared/schema";

interface CircularLogoProps {
  centerText: string;
  companyName?: string;
  settings: DesignSettings;
  segments?: Array<{
    number: string;
    title: string;
    description: string;
  }>;
  size?: number;
}

export function CircularLogo({
  centerText,
  companyName = "",
  settings,
  segments,
  size = 400
}: CircularLogoProps) {
  // Always use fixed segments - ignore passed segments
  const segmentData = [
    {
      number: "01",
      title: "PROVEN ROI\nACCELERATION",
      description: "We make brands impossible\nto ignore. Your growth\nbecomes our legacy."
    },
    {
      number: "02",
      title: "FULL-SPECTRUM\nCREATIVE\nPOWERHOUSE",
      description: "We don't make ads,\nwe craft experiences.\nFrom CGI to viral content."
    },
    {
      number: "03",
      title: "STRATEGIC\nPARTNERSHIP\nAPPROACH",
      description: "We succeed when you\ndominate. Your competitors\nbecome our case studies."
    },
    {
      number: "04",
      title: "CUTTING-EDGE\nTECHNOLOGY\n& INSIGHTS",
      description: "While others catch up,\nwe stay ahead. Next-gen\nstrategies for tomorrow."
    }
  ];

  // Generate colors for segments - alternating pattern
  const getSegmentColor = (index: number): string => {
    const colors = [
      '#E5E5E5',  // Light gray
      settings.primaryColor,
      '#2C2C2C',  // Dark gray/black
      settings.primaryColor
    ];
    return colors[index % colors.length];
  };

  // HUGE padding on ALL 4 SIDES to prevent ANY cutting
  const padding = 200; // MASSIVE padding
  const viewBoxSize = size + (padding * 2);
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const outerRadius = (size / 2) - 15; // LARGE outer circle
  const innerRadius = size / 7; // SMALL center circle - MORE ROOM for text in segments
  const segmentCount = segmentData.length;
  const anglePerSegment = (2 * Math.PI) / segmentCount;

  // Helper function to create arc path
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    outerR: number,
    innerR: number
  ): string => {
    const startOuterX = centerX + outerR * Math.cos(startAngle);
    const startOuterY = centerY + outerR * Math.sin(startAngle);
    const endOuterX = centerX + outerR * Math.cos(endAngle);
    const endOuterY = centerY + outerR * Math.sin(endAngle);

    const startInnerX = centerX + innerR * Math.cos(endAngle);
    const startInnerY = centerY + innerR * Math.sin(endAngle);
    const endInnerX = centerX + innerR * Math.cos(startAngle);
    const endInnerY = centerY + innerR * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${startOuterX} ${startOuterY}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
      L ${startInnerX} ${startInnerY}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
      Z
    `;
  };

  // Calculate text position for each segment
  const getTextPosition = (index: number) => {
    const midAngle = -Math.PI / 2 + anglePerSegment * index + anglePerSegment / 2;
    const textRadius = (outerRadius + innerRadius) / 2; // Centered in segment
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      angle: (midAngle * 180) / Math.PI
    };
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      style={{
        maxWidth: '100%',
        minHeight: '100%',
        height: 'auto',
        overflow: 'visible',
        display: 'block',
        margin: '0 auto',
        padding: '0'
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Segments */}
      {segmentData.map((segment, index) => {
        const startAngle = -Math.PI / 2 + anglePerSegment * index;
        const endAngle = startAngle + anglePerSegment;
        const path = createArcPath(startAngle, endAngle, outerRadius, innerRadius);
        const color = getSegmentColor(index);
        const textPos = getTextPosition(index);
        const isLight = color === '#E5E5E5';

        return (
          <g key={index}>
            {/* Segment path */}
            <path
              d={path}
              fill={color}
              stroke="#fff"
              strokeWidth="3"
            />

            {/* Number */}
            <text
              x={textPos.x}
              y={textPos.y - 50}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isLight ? '#000' : '#fff'}
              fontSize="48"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              {segment.number}
            </text>

            {/* Title - split by \n */}
            {segment.title.split('\n').map((line, lineIndex) => (
              <text
                key={lineIndex}
                x={textPos.x}
                y={textPos.y - 15 + lineIndex * 18}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isLight ? '#000' : '#fff'}
                fontSize="16"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
                letterSpacing="1.2"
              >
                {line}
              </text>
            ))}

            {/* Description - split by \n */}
            {segment.description.split('\n').map((line, lineIndex) => (
              <text
                key={lineIndex}
                x={textPos.x}
                y={textPos.y + 40 + lineIndex * 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isLight ? '#444' : 'rgba(255,255,255,0.95)'}
                fontSize="13"
                fontFamily="Arial, sans-serif"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Center circle with gradient border */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius + 12}
        fill="#fff"
        stroke="url(#borderGradient)"
        strokeWidth="8"
      />

      {/* Inner white circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="#fff"
      />

      {/* Center text */}
      <text
        x={centerX}
        y={centerY - 22}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#000"
        fontFamily="Arial, sans-serif"
      >
        {centerText.split('\n').map((line, index) => (
          <tspan
            key={index}
            x={centerX}
            dy={index === 0 ? 0 : 20}
          >
            {line}
          </tspan>
        ))}
      </text>

      {/* Company name in the center (highlighted) */}
      {companyName && (
        <text
          x={centerX}
          y={centerY + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="bold"
          fill={settings.primaryColor}
          fontFamily="Arial, sans-serif"
        >
          {companyName}
        </text>
      )}

      <text
        x={centerX}
        y={centerY + 28}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#000"
        fontFamily="Arial, sans-serif"
      >
        OVER OTHERS
      </text>

      {/* Gradient definition for border */}
      <defs>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={settings.primaryColor} />
          <stop offset="50%" stopColor="#000" />
          <stop offset="100%" stopColor={settings.primaryColor} />
        </linearGradient>
      </defs>
    </svg>
  );
}
