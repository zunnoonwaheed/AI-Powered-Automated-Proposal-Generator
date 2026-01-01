import type { Proposal, ProposalSection, DesignSettings } from "@shared/schema";
import { CircularLogo } from "./CircularLogo";

interface ProposalPreviewProps {
  proposal: Proposal;
  scale?: number;
}

export function ProposalPreview({ proposal, scale = 0.5 }: ProposalPreviewProps) {
  const { sections, designSettings, clientName } = proposal;

  // Group sections into pages (2 sections per page after cover)
  const pages: ProposalSection[][] = [];

  sections.forEach((section, index) => {
    if (section.type === 'cover') {
      // Cover gets its own page
      pages.push([section]);
    } else if (section.type === 'contact') {
      // Contact gets its own page
      pages.push([section]);
    } else if (section.type === 'why-choose-us') {
      // Why Choose Us gets its own FULL page for the circular logo
      pages.push([section]);
    } else {
      // Group other sections in pairs
      const lastPage = pages[pages.length - 1];
      if (lastPage && lastPage.length === 1 && lastPage[0].type !== 'cover' && lastPage[0].type !== 'contact' && lastPage[0].type !== 'why-choose-us') {
        // Add to existing page if it has only 1 section
        lastPage.push(section);
      } else {
        // Start new page
        pages.push([section]);
      }
    }
  });

  return (
    <div
      className="shadow-2xl"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '210mm',
        minWidth: '210mm',
        fontFamily: getFontFamily(designSettings.fontFamily),
      }}
    >
      {pages.map((pageSections, pageIndex) => (
        <div
          key={pageIndex}
          style={{
            minHeight: '297mm',
            maxHeight: '297mm',
            display: 'flex',
            flexDirection: 'column',
            pageBreakAfter: 'always',
            pageBreakInside: 'avoid'
          }}
        >
          {pageSections.map((section, sectionIndex) => (
            <div key={section.id}>
              {renderSection(section, designSettings, clientName, sections.indexOf(section))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function getFontFamily(font: string): string {
  switch (font) {
    case "inter": return "'Inter', sans-serif";
    case "poppins": return "'Poppins', sans-serif";
    case "outfit": return "'Outfit', sans-serif";
    default: return "'Poppins', sans-serif";
  }
}

function renderSection(
  section: ProposalSection, 
  settings: DesignSettings,
  clientName: string,
  index: number
) {
  switch (section.type) {
    case "cover":
      return <CoverSection section={section} settings={settings} clientName={clientName} />;
    case "project-summary":
    case "approach":
      return <ContentSection section={section} settings={settings} />;
    case "deliverables":
      return <DeliverablesSection section={section} settings={settings} />;
    case "timeline":
      return <TimelineSection section={section} settings={settings} />;
    case "why-choose-us":
      return <WhyChooseUsSection section={section} settings={settings} />;
    case "pricing":
      return <TermsSection section={section} settings={settings} />;
    case "next-steps":
      return <NextStepsSection section={section} settings={settings} />;
    case "contact":
      return <ContactSection section={section} settings={settings} />;
    default:
      return <ContentSection section={section} settings={settings} />;
  }
}

function CoverSection({ 
  section, 
  settings, 
  clientName 
}: { 
  section: ProposalSection; 
  settings: DesignSettings;
  clientName: string;
}) {
  return (
    <div 
      className="relative flex flex-col justify-center items-center"
      style={{
        background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`,
        minHeight: '297mm',
        padding: '60px',
      }}
    >
      {settings.logoUrl && (
        <div className="absolute top-10 left-12">
          <img
            src={settings.logoUrl}
            alt="Kayi Digital Logo"
            className="max-w-[140px] max-h-[70px] object-contain"
          />
        </div>
      )}

      {settings.clientLogoUrl && (
        <div className="absolute top-10 right-12">
          <img
            src={settings.clientLogoUrl}
            alt="Client Logo"
            className="max-w-[140px] max-h-[70px] object-contain"
          />
        </div>
      )}

      <div className="text-center flex-1 flex flex-col justify-center items-center">
        <h1 
          className="font-bold text-white mb-8"
          style={{ 
            fontSize: '56px',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.2)'
          }}
        >
          {section.title}
        </h1>
        {section.subtitle && (
          <p 
            className="text-white/80"
            style={{ fontSize: '22px', maxWidth: '600px' }}
          >
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-0.5 bg-white/30" />
          <p 
            className="text-white/60 uppercase tracking-widest"
            style={{ fontSize: '11px', letterSpacing: '4px' }}
          >
            Proposal for {clientName}
          </p>
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '5px', backgroundColor: settings.accentColor }}
      />
    </div>
  );
}

function SectionHeader({ title, settings, isDarkBg }: { title: string; settings: DesignSettings; isDarkBg?: boolean }) {
  return (
    <div className="mb-6">
      <h2
        className="font-bold mb-3"
        style={{
          color: isDarkBg ? '#ffffff' : settings.secondaryColor,
          fontSize: '24px',
          letterSpacing: '-0.5px'
        }}
      >
        {title}
      </h2>
      <div
        className="rounded-full"
        style={{
          width: '60px',
          height: '3px',
          background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})`
        }}
      />
    </div>
  );
}

function ContentSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';
  const textColor = isDarkBg ? '#ffffff' : '#555';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '35px 50px',
        maxHeight: '148mm',
        minHeight: 'auto',
        overflow: 'hidden'
      }}
    >
      <SectionHeader title={section.title} settings={settings} isDarkBg={isDarkBg} />
      <div
        className="leading-relaxed whitespace-pre-wrap"
        style={{
          color: textColor,
          fontSize: '11px',
          lineHeight: 1.7,
          maxWidth: '95%',
          paddingBottom: '20px'
        }}
      >
        {section.content}
      </div>
    </div>
  );
}

function DeliverablesSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.deliverableItems || [];
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';
  const textColor = isDarkBg ? '#ffffff' : '#555';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '35px 50px',
        maxHeight: '148mm',
        minHeight: 'auto',
        overflow: 'hidden'
      }}
    >
      <SectionHeader title={section.title} settings={settings} isDarkBg={isDarkBg} />
      <div className="space-y-6" style={{ paddingBottom: '20px' }}>
        {items.slice(0, 4).map((phase, index) => (
          <div key={phase.id}>
            <h3
              className="font-semibold mb-2 flex items-center gap-3"
              style={{
                color: isDarkBg ? '#ffffff' : settings.secondaryColor,
                fontSize: '13px'
              }}
            >
              <span
                className="rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: settings.primaryColor,
                  width: '26px',
                  height: '26px',
                  fontSize: '12px'
                }}
              >
                {index + 1}
              </span>
              {phase.title}
            </h3>
            <ul className="space-y-1.5" style={{ paddingLeft: '40px' }}>
              {phase.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5"
                  style={{ color: textColor, fontSize: '10px', lineHeight: 1.5 }}
                >
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: settings.primaryColor,
                      width: '5px',
                      height: '5px',
                      marginTop: '5px'
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.timelineItems || [];
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '35px 50px',
        maxHeight: '148mm',
        minHeight: 'auto',
        overflow: 'hidden'
      }}
    >
      <SectionHeader title={section.title} settings={settings} isDarkBg={isDarkBg} />

      {/* Proper Timeline with Vertical Line */}
      <div style={{ marginTop: '24px', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Timeline Line & Dot */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '40px',
                  position: 'relative'
                }}
              >
                {/* Dot/Circle */}
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: settings.primaryColor,
                    border: `3px solid ${bgColor}`,
                    boxShadow: `0 0 0 2px ${settings.primaryColor}`,
                    zIndex: 2,
                    marginTop: '4px',
                    flexShrink: 0
                  }}
                />
                {/* Vertical Line */}
                {index < items.slice(0, 5).length - 1 && (
                  <div
                    style={{
                      width: '3px',
                      flex: 1,
                      backgroundColor: `${settings.primaryColor}40`,
                      marginTop: '4px',
                      marginBottom: '4px',
                      minHeight: '40px'
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: '18px' }}>
                {/* Period */}
                <div
                  style={{
                    fontSize: '8.5px',
                    fontWeight: '700',
                    color: settings.primaryColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '6px'
                  }}
                >
                  {item.period}
                </div>
                {/* Title */}
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: isDarkBg ? '#ffffff' : settings.secondaryColor,
                    marginBottom: '5px',
                    lineHeight: 1.3
                  }}
                >
                  {item.title}
                </h4>
                {/* Description */}
                <p
                  style={{
                    fontSize: '10px',
                    color: isDarkBg ? '#cccccc' : '#666',
                    lineHeight: 1.6,
                    marginBottom: '0'
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhyChooseUsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.featureItems || [];

  // Default stats if none provided
  const stats = section.statItems || [
    { id: "stat-1", value: "500+", label: "Projects Delivered" },
    { id: "stat-2", value: "98%", label: "Client Satisfaction" },
    { id: "stat-3", value: "10+", label: "Years Experience" },
    { id: "stat-4", value: "24/7", label: "Support Available" },
  ];

  // Check if circular logo is enabled
  if (section.useCircularLogo) {
    const companyName = section.companyName || "";
    const centerText = "WHY CHOOSE"; // Fixed text

    return (
      <div
        className="bg-white flex flex-col"
        style={{
          minHeight: '297mm',
          maxHeight: '297mm',
          padding: '40px 50px 40px 50px',
          overflow: 'visible',
          gap: '0'
        }}
      >
        <div style={{ marginBottom: '0px', marginTop: '0px' }}>
          <div className="mb-0">
            <h2
              className="font-bold mb-0"
              style={{
                color: settings.secondaryColor,
                fontSize: '24px',
                letterSpacing: '-0.5px',
                marginBottom: '0px'
              }}
            >
              {section.title}
            </h2>
            <div
              className="rounded-full"
              style={{
                width: '60px',
                height: '3px',
                background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})`,
                marginTop: '12px',
                marginBottom: '0px'
              }}
            />
          </div>
        </div>
        <div
          className="flex justify-center items-center flex-1"
          style={{
            width: '100%',
            overflow: 'visible',
            marginTop: '-20px',
            paddingTop: '0px'
          }}
        >
          <div style={{ width: '100%', maxWidth: '100%', overflow: 'visible', marginTop: '0px' }}>
            <CircularLogo
              centerText={centerText}
              companyName={companyName}
              settings={settings}
              size={600}
            />
          </div>
        </div>

        {/* By The Numbers Section - Below Circular Logo */}
        <div
          style={{
            marginTop: '-150px',
            paddingTop: '0px',
            paddingBottom: '10px'
          }}
        >
          <div
            style={{
              backgroundColor: `${settings.primaryColor}08`,
              borderRadius: '12px',
              padding: '20px 28px',
              border: `1px solid ${settings.primaryColor}15`
            }}
          >
            <h3
              className="font-bold text-center mb-4"
              style={{
                fontSize: '11px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: settings.secondaryColor,
                opacity: 0.85
              }}
            >
              By The Numbers
            </h3>
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`
              }}
            >
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div
                    className="font-bold mb-1"
                    style={{
                      fontSize: '24px',
                      lineHeight: 1,
                      color: settings.primaryColor
                    }}
                  >
                    {stat.value}
                  </div>
                  <p
                    style={{
                      color: '#777',
                      fontSize: '8px',
                      lineHeight: 1.3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an image URL, show image-based layout
  if (section.imageUrl) {
    return (
      <div
        className="bg-white"
        style={{
          padding: '35px 50px',
          maxHeight: '148mm',
          minHeight: 'auto',
          overflow: 'hidden'
        }}
      >
        <SectionHeader title={section.title} settings={settings} />
        <div className="flex justify-center items-center" style={{ marginTop: '15px', paddingBottom: '20px' }}>
          <img
            src={section.imageUrl}
            alt={section.title}
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '450px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    );
  }

  // Default feature grid layout
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${settings.secondaryColor} 0%, ${settings.primaryColor}ee 100%)`,
        padding: '35px 50px',
        maxHeight: '148mm',
        minHeight: 'auto',
        overflow: 'hidden'
      }}
    >
      <div className="mb-6">
        <h2
          className="text-white font-bold mb-3"
          style={{ fontSize: '24px', letterSpacing: '-0.5px' }}
        >
          {section.title}
        </h2>
        <div
          className="rounded-full"
          style={{
            width: '60px',
            height: '3px',
            backgroundColor: settings.accentColor
          }}
        />
      </div>

      <div
        className="grid grid-cols-2 gap-6"
        style={{ marginTop: '20px' }}
      >
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className="flex items-start gap-4">
              <div
                className="text-white font-bold"
                style={{
                  fontSize: '42px',
                  opacity: 0.15,
                  lineHeight: 1
                }}
              >
                {item.number}
              </div>
              <div style={{ paddingTop: '6px', flex: 1 }}>
                <h4
                  className="text-white font-bold mb-2"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '1.2px'
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '11px',
                    lineHeight: 1.6
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* By The Numbers Section - Always show if stats exist or use defaults */}
      <div
        style={{
          marginTop: '30px',
          paddingTop: '26px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <h3
          className="text-white font-bold text-center mb-6"
          style={{
            fontSize: '14px',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            opacity: 0.95
          }}
        >
          By The Numbers
        </h3>
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`
          }}
        >
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div
                className="text-white font-bold mb-2"
                style={{ fontSize: '28px', lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '9px',
                  lineHeight: 1.4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TermsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.termItems || [];
  const tableRows = section.pricingTableRows || [];
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '35px 50px',
        maxHeight: '148mm',
        minHeight: 'auto',
        overflow: 'hidden'
      }}
    >
      <SectionHeader title={section.title} settings={settings} isDarkBg={isDarkBg} />

      {/* Table-based pricing */}
      {tableRows.length > 0 ? (
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '16px',
              border: `2px solid ${settings.primaryColor}`,
            }}
          >
            <thead>
              <tr style={{
                backgroundColor: `${settings.primaryColor}15`,
                borderBottom: `2px solid ${settings.primaryColor}`
              }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: settings.secondaryColor,
                    width: '28%'
                  }}
                >
                  {section.tableHeaders?.service || 'Service Component'}
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: settings.secondaryColor,
                    width: '48%'
                  }}
                >
                  {section.tableHeaders?.description || 'What You Get'}
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: settings.secondaryColor,
                    width: '24%'
                  }}
                >
                  {section.tableHeaders?.investment || 'Investment'}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => {
                const isTotal = index === tableRows.length - 1 && row.service.toLowerCase().includes('total');
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${settings.primaryColor}30`,
                      backgroundColor: isTotal ? `${settings.primaryColor}08` : 'transparent'
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        fontSize: '11px',
                        color: '#444',
                        fontWeight: isTotal ? '700' : '500',
                        verticalAlign: 'top'
                      }}
                    >
                      {row.service}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontSize: '11px',
                        color: '#555',
                        lineHeight: 1.5,
                        verticalAlign: 'top'
                      }}
                    >
                      {row.description}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontSize: isTotal ? '14px' : '11px',
                        color: isTotal ? settings.primaryColor : '#555',
                        fontWeight: isTotal ? '700' : '500',
                        textAlign: 'center',
                        verticalAlign: 'top'
                      }}
                    >
                      {row.investment}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Payment Terms */}
          <div style={{ marginTop: '16px' }}>
            <h4
              className="font-semibold mb-2"
              style={{
                color: settings.secondaryColor,
                fontSize: '12px'
              }}
            >
              Payment Structure
            </h4>
            <div
              style={{
                color: '#666',
                fontSize: '10px',
                lineHeight: 1.6,
                paddingLeft: '12px',
                borderLeft: `2px solid ${settings.primaryColor}`
              }}
            >
              {section.paymentTerms || '70% upfront and remaining 30% on project completion'}
            </div>
          </div>
        </div>
      ) : (
        /* Legacy term-based layout */
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id}>
              <h4
                className="font-semibold mb-2"
                style={{
                  color: settings.secondaryColor,
                  fontSize: '12px'
                }}
              >
                {item.title}
              </h4>
              <div
                className="whitespace-pre-wrap"
                style={{
                  color: '#666',
                  fontSize: '10px',
                  lineHeight: 1.6,
                  paddingLeft: '12px',
                  borderLeft: `2px solid ${settings.primaryColor}35`
                }}
              >
                {item.content}
              </div>
            </div>
          ))}

          {section.totalAmount && (
            <div
              className="text-center rounded-lg"
              style={{
                backgroundColor: `${settings.primaryColor}08`,
                padding: '16px',
                marginTop: '20px'
              }}
            >
              <span
                className="block"
                style={{ color: '#666', fontSize: '10px' }}
              >
                Total Investment
              </span>
              <div
                className="font-bold"
                style={{
                  color: settings.primaryColor,
                  fontSize: '24px',
                  marginTop: '4px'
                }}
              >
                {section.totalAmount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NextStepsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const steps = section.nextStepItems || [];
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '35px 50px',
        minHeight: '148mm',
        overflow: 'visible'
      }}
    >
      <SectionHeader title={section.title} settings={settings} isDarkBg={isDarkBg} />

      {/* Modern Card Grid Layout - Perfect Alignment */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginTop: '20px',
          alignItems: 'stretch'
        }}
      >
        {steps.slice(0, 5).map((step, index) => {
          const isLast = index === steps.slice(0, 5).length - 1;
          return (
            <div
              key={step.id}
              style={{
                position: 'relative',
                padding: '16px 10px',
                borderRadius: '10px',
                backgroundColor: isLast ? `${settings.primaryColor}` : (isDarkBg ? '#1a1a1a' : '#fff'),
                border: isLast ? 'none' : `2px solid ${settings.primaryColor}15`,
                boxShadow: isLast
                  ? `0 4px 16px ${settings.primaryColor}35`
                  : '0 2px 8px rgba(0,0,0,0.04)',
                textAlign: 'center'
              }}
            >
              {/* Step Number Badge - Fixed Position */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isLast ? 'rgba(255,255,255,0.25)' : settings.primaryColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  margin: '0 auto 10px',
                  boxShadow: isLast
                    ? '0 2px 6px rgba(0,0,0,0.12)'
                    : `0 2px 6px ${settings.primaryColor}25`
                }}
              >
                {index + 1}
              </div>

              {/* Step Title - Fixed 2 Lines */}
              <div
                style={{
                  minHeight: '28px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <h4
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isLast ? '#fff' : (isDarkBg ? '#ffffff' : settings.secondaryColor),
                    lineHeight: 1.3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    margin: 0,
                    padding: '0 2px'
                  }}
                >
                  {step.step}
                </h4>
              </div>

              {/* Step Description - Fixed 4 Lines */}
              <div
                style={{
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <p
                  style={{
                    fontSize: '8.5px',
                    color: isLast ? 'rgba(255,255,255,0.92)' : '#666',
                    lineHeight: 1.5,
                    margin: 0,
                    padding: '0 3px'
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Arrow Connector (except last) */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '0',
                    height: '0',
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    borderLeft: `7px solid ${settings.primaryColor}25`,
                    zIndex: 1
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContactSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  // Determine if background is dark
  const bgColor = settings.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';
  const textColor = isDarkBg ? '#ffffff' : settings.secondaryColor;
  const logoFilter = isDarkBg ? 'brightness(0) invert(1)' : 'none';

  return (
    <div
      className="relative"
      style={{
        backgroundColor: bgColor,
        minHeight: '297mm',
        maxHeight: '297mm',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Gradient Envelope Shape - Inclined */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%'
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 600"
      >
        <defs>
          <linearGradient id="contactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={settings.primaryColor} />
            <stop offset="35%" stopColor={settings.primaryColor} />
            <stop offset="100%" stopColor={settings.secondaryColor} />
          </linearGradient>
          <linearGradient id="contactGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={settings.accentColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={settings.primaryColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M 0 0 L 1200 0 L 1200 500 L 300 600 L 0 480 Z"
          fill="url(#contactGradient)"
        />
        <path
          d="M 0 0 L 1200 0 L 1200 500 L 300 600 L 0 480 Z"
          fill="url(#contactGradient2)"
        />
      </svg>

      {/* Content - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '80px',
          zIndex: 2
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '20px' }}>
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Company Logo"
              style={{
                width: '75px',
                height: '75px',
                objectFit: 'contain',
                filter: logoFilter
              }}
            />
          ) : (
            <svg width="75" height="75" viewBox="0 0 75 75" fill="none">
              <rect x="5" y="5" width="28" height="28" fill={textColor} rx="3"/>
              <rect x="42" y="5" width="28" height="28" fill={textColor} rx="3"/>
              <rect x="5" y="42" width="28" height="28" fill={textColor} rx="3"/>
              <rect x="42" y="42" width="28" height="28" fill={textColor} rx="3"/>
            </svg>
          )}
        </div>

        {/* Company Name */}
        <h1
          style={{
            color: textColor,
            fontSize: '42px',
            fontWeight: '700',
            lineHeight: 1.2,
            marginBottom: '20px',
            letterSpacing: '-0.8px'
          }}
        >
          {settings.companyName || 'Your Company'}
        </h1>

        {/* Separator Line */}
        <div
          style={{
            width: '320px',
            height: '3px',
            background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})`,
            marginBottom: '24px'
          }}
        />

        {/* Contact Info */}
        <div>
          <p
            style={{
              color: textColor,
              fontSize: '15px',
              fontWeight: '400',
              marginBottom: '6px',
              letterSpacing: '0.2px'
            }}
          >
            {section.contactEmail || 'www.yourwebsite.com'}
          </p>
          <p
            style={{
              color: textColor,
              fontSize: '15px',
              fontWeight: '400',
              letterSpacing: '0.2px'
            }}
          >
            {section.contactPhone || '@yourhandle'}
          </p>
        </div>
      </div>
    </div>
  );
}
