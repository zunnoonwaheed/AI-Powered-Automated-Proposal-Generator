import type { Proposal, ProposalSection, DesignSettings } from "@shared/schema";

interface ProposalPreviewProps {
  proposal: Proposal;
  scale?: number;
}

export function ProposalPreview({ proposal, scale = 0.5 }: ProposalPreviewProps) {
  const { sections, designSettings, clientName } = proposal;

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
      {sections.map((section, index) => (
        <div key={section.id}>
          {renderSection(section, designSettings, clientName, index)}
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
        <div className="absolute top-10 right-12">
          <img 
            src={settings.logoUrl} 
            alt="Company Logo" 
            className="max-w-[140px] max-h-[70px] object-contain"
          />
        </div>
      )}

      <div 
        className="absolute top-10 left-12 text-sm font-medium tracking-widest"
        style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '3px' }}
      >
        {settings.companyName.toLowerCase()}
      </div>

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

function SectionHeader({ title, settings }: { title: string; settings: DesignSettings }) {
  return (
    <div className="mb-10">
      <h2 
        className="font-bold mb-4"
        style={{ 
          color: settings.secondaryColor,
          fontSize: '28px',
          letterSpacing: '-0.5px'
        }}
      >
        {title}
      </h2>
      <div 
        className="rounded-full"
        style={{ 
          width: '70px',
          height: '4px',
          background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})` 
        }}
      />
    </div>
  );
}

function ContentSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  return (
    <div 
      className="bg-white"
      style={{ padding: '60px', minHeight: '297mm' }}
    >
      <SectionHeader title={section.title} settings={settings} />
      <div 
        className="leading-relaxed whitespace-pre-wrap"
        style={{ 
          color: '#555',
          fontSize: '13px',
          lineHeight: 1.9,
          maxWidth: '85%'
        }}
      >
        {section.content}
      </div>
    </div>
  );
}

function DeliverablesSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.deliverableItems || [];

  return (
    <div 
      className="bg-white"
      style={{ padding: '60px', minHeight: '297mm' }}
    >
      <SectionHeader title={section.title} settings={settings} />
      <div className="space-y-10">
        {items.map((phase, index) => (
          <div key={phase.id}>
            <h3 
              className="font-semibold mb-5 flex items-center gap-4"
              style={{ 
                color: settings.secondaryColor,
                fontSize: '17px'
              }}
            >
              <span 
                className="rounded-full flex items-center justify-center text-white font-bold"
                style={{ 
                  backgroundColor: settings.primaryColor,
                  width: '36px',
                  height: '36px',
                  fontSize: '14px'
                }}
              >
                {index + 1}
              </span>
              {phase.title}
            </h3>
            <ul className="space-y-3" style={{ paddingLeft: '52px' }}>
              {phase.items.map((item, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-4"
                  style={{ color: '#555', fontSize: '13px', lineHeight: 1.7 }}
                >
                  <span 
                    className="rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: settings.primaryColor,
                      width: '7px',
                      height: '7px',
                      marginTop: '8px'
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

  return (
    <div 
      className="bg-white"
      style={{ padding: '60px', minHeight: '297mm' }}
    >
      <SectionHeader title={section.title} settings={settings} />
      <div className="relative" style={{ paddingLeft: '50px' }}>
        <div 
          className="absolute top-3 bottom-3"
          style={{ 
            left: '20px',
            width: '3px',
            backgroundColor: `${settings.primaryColor}25`,
            borderRadius: '2px'
          }}
        />
        <div className="space-y-10">
          {items.map((item, index) => (
            <div key={item.id} className="relative" style={{ paddingLeft: '40px' }}>
              <div 
                className="absolute rounded-full bg-white"
                style={{ 
                  left: '-30px',
                  top: '6px',
                  width: '22px',
                  height: '22px',
                  border: `4px solid ${settings.primaryColor}`
                }}
              />
              <div className="flex items-baseline gap-4 mb-3">
                <span 
                  className="text-white font-bold rounded-full"
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    fontSize: '11px',
                    padding: '5px 14px'
                  }}
                >
                  {item.period}
                </span>
                <h4 
                  className="font-semibold"
                  style={{ 
                    color: settings.secondaryColor,
                    fontSize: '16px'
                  }}
                >
                  {item.title}
                </h4>
              </div>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.7 }}>
                {item.description}
              </p>
              {item.items && item.items.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {item.items.map((subItem, i) => (
                    <li 
                      key={i} 
                      className="flex items-center gap-2"
                      style={{ color: '#666', fontSize: '12px' }}
                    >
                      <span 
                        className="rounded-full"
                        style={{ 
                          backgroundColor: settings.accentColor,
                          width: '5px',
                          height: '5px'
                        }}
                      />
                      {subItem}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhyChooseUsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.featureItems || [];

  return (
    <div 
      style={{
        background: `linear-gradient(135deg, ${settings.secondaryColor} 0%, ${settings.primaryColor}ee 100%)`,
        minHeight: '297mm',
        padding: '60px',
      }}
    >
      <div className="mb-10">
        <h2 
          className="text-white font-bold mb-4"
          style={{ fontSize: '28px', letterSpacing: '-0.5px' }}
        >
          {section.title}
        </h2>
        <div 
          className="rounded-full"
          style={{ 
            width: '70px',
            height: '4px',
            backgroundColor: settings.accentColor
          }}
        />
      </div>

      <div 
        className="grid grid-cols-2 gap-10"
        style={{ marginTop: '40px' }}
      >
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className="flex items-start gap-5">
              <div 
                className="text-white font-bold"
                style={{ 
                  fontSize: '52px',
                  opacity: 0.15,
                  lineHeight: 1
                }}
              >
                {item.number}
              </div>
              <div style={{ paddingTop: '10px', flex: 1 }}>
                <h4 
                  className="text-white font-bold mb-3"
                  style={{ 
                    fontSize: '12px',
                    letterSpacing: '1.5px'
                  }}
                >
                  {item.title}
                </h4>
                <p 
                  style={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '12px',
                    lineHeight: 1.7
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const items = section.termItems || [];

  return (
    <div 
      className="bg-white"
      style={{ padding: '60px', minHeight: '297mm' }}
    >
      <SectionHeader title={section.title} settings={settings} />
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id}>
            <h4 
              className="font-semibold mb-3"
              style={{ 
                color: settings.secondaryColor,
                fontSize: '15px'
              }}
            >
              {item.title}
            </h4>
            <div 
              className="whitespace-pre-wrap"
              style={{ 
                color: '#666',
                fontSize: '12px',
                lineHeight: 1.8,
                paddingLeft: '18px',
                borderLeft: `3px solid ${settings.primaryColor}35`
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
              padding: '28px',
              marginTop: '40px'
            }}
          >
            <span 
              className="block"
              style={{ color: '#666', fontSize: '12px' }}
            >
              Total Investment
            </span>
            <div 
              className="font-bold"
              style={{ 
                color: settings.primaryColor,
                fontSize: '32px',
                marginTop: '8px'
              }}
            >
              {section.totalAmount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NextStepsSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  const steps = section.nextStepItems || [];
  const requirements = section.items || [];

  return (
    <div 
      className="bg-white"
      style={{ padding: '60px', minHeight: '297mm' }}
    >
      <SectionHeader title={section.title} settings={settings} />
      
      <div className="mb-10">
        <h4 
          className="font-semibold mb-5"
          style={{ color: settings.secondaryColor, fontSize: '15px' }}
        >
          Getting Started
        </h4>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <span 
                className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ 
                  backgroundColor: settings.primaryColor,
                  width: '28px',
                  height: '28px',
                  fontSize: '12px'
                }}
              >
                {index + 1}
              </span>
              <div style={{ color: '#666', fontSize: '13px', lineHeight: 1.7, paddingTop: '4px' }}>
                <strong style={{ color: settings.secondaryColor }}>{step.step}:</strong>{' '}
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {requirements.length > 0 && (
        <div>
          <h4 
            className="font-semibold mb-5"
            style={{ color: settings.secondaryColor, fontSize: '15px' }}
          >
            What We Need From You
          </h4>
          <ul className="space-y-3">
            {requirements.map((req, index) => (
              <li 
                key={index} 
                className="flex items-start gap-4"
                style={{ color: '#666', fontSize: '13px', lineHeight: 1.7 }}
              >
                <span 
                  className="rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    width: '7px',
                    height: '7px',
                    marginTop: '8px'
                  }}
                />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ContactSection({ section, settings }: { section: ProposalSection; settings: DesignSettings }) {
  return (
    <div 
      className="relative flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`,
        minHeight: '297mm',
        padding: '60px',
      }}
    >
      <div className="mb-10">
        <h2 
          className="text-white font-bold mb-4"
          style={{ fontSize: '28px', letterSpacing: '-0.5px' }}
        >
          {section.title}
        </h2>
        <div 
          className="rounded-full"
          style={{ 
            width: '70px',
            height: '4px',
            backgroundColor: settings.accentColor
          }}
        />
      </div>

      <p 
        style={{ 
          color: 'rgba(255,255,255,0.8)',
          fontSize: '13px',
          maxWidth: '450px',
          lineHeight: 1.7,
          marginBottom: '50px'
        }}
      >
        Our team is ready to bring your vision to life. We're excited about the opportunity to work together and deliver exceptional results.
      </p>

      <div 
        className="flex justify-between items-end flex-1"
        style={{ paddingBottom: '50px' }}
      >
        <div>
          <p 
            className="text-white font-medium"
            style={{ fontSize: '16px', marginBottom: '6px' }}
          >
            {section.contactName}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            {section.contactTitle}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '12px' }}>
            {section.contactPhone}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            {section.contactEmail}
          </p>
        </div>

        <div className="text-right">
          <p 
            className="text-white font-bold"
            style={{ 
              fontSize: '18px',
              letterSpacing: '2px',
              marginBottom: '20px'
            }}
          >
            {section.closingMessage}
          </p>
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Company Logo" 
              className="ml-auto"
              style={{ 
                maxWidth: '110px',
                maxHeight: '55px',
                objectFit: 'contain',
                opacity: 0.85
              }}
            />
          )}
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '5px', backgroundColor: settings.accentColor }}
      />
    </div>
  );
}
