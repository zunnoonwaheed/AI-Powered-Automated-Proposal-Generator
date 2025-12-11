import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer from "puppeteer";
import { analyzeRequirementsSchema } from "@shared/schema";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // AI Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      // Check if API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({
          success: false,
          error: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file."
        });
      }

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const { text } = analyzeRequirementsSchema.parse(req.body);

      const systemPrompt = `You are an expert proposal writer and business analyst. Analyze the provided project requirements and extract key information to help generate a professional proposal.

Return a JSON object with the following structure:
{
  "projectName": "Name of the project",
  "clientName": "Client name if mentioned, or 'Client' as default",
  "summary": "A professional 2-3 paragraph summary of the project scope, objectives, and expected outcomes",
  "deliverables": [
    {
      "title": "Phase or category name",
      "items": ["Deliverable 1", "Deliverable 2", ...]
    }
  ],
  "timeline": [
    {
      "period": "Time period (e.g., 'Week 1-2', 'Month 1')",
      "title": "Phase name",
      "description": "Brief description of activities"
    }
  ],
  "suggestedApproach": "A paragraph describing the recommended approach and methodology",
  "keyRequirements": ["Requirement 1", "Requirement 2", ...]
}

Be professional, thorough, and create content that would be suitable for a high-end agency proposal.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze the following project requirements and generate proposal content:\n\n${text}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from AI");
      }

      // Parse the JSON response with robust error handling
      let analysisData;
      try {
        // Try to extract JSON from the response - handle code blocks too
        let jsonText = content.text;
        
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try to find JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
        
        // Provide defaults for missing fields
        analysisData = {
          projectName: analysisData.projectName || "Project Proposal",
          clientName: analysisData.clientName || "Client",
          summary: analysisData.summary || "",
          deliverables: analysisData.deliverables || [],
          timeline: analysisData.timeline || [],
          suggestedApproach: analysisData.suggestedApproach || "",
          keyRequirements: analysisData.keyRequirements || [],
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", content.text);
        // Return a fallback response
        analysisData = {
          projectName: "Project Proposal",
          clientName: "Client",
          summary: content.text.substring(0, 500),
          deliverables: [],
          timeline: [],
          suggestedApproach: "",
          keyRequirements: [],
        };
      }

      res.json({ success: true, data: analysisData });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Analysis failed" 
      });
    }
  });

  // PDF Generation endpoint
  app.post("/api/generate-pdf", async (req, res) => {
    let browser;
    try {
      const { proposal } = req.body;

      if (!proposal) {
        return res.status(400).json({ error: "Proposal data required" });
      }

      console.log("Generating PDF for proposal:", proposal.title);

      // Generate HTML for the proposal
      const html = generateProposalHTML(proposal);
      console.log("HTML generated, length:", html.length);

      // Launch Puppeteer and generate PDF
      console.log("Launching browser...");
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });

      const page = await browser.newPage();
      console.log("Setting page content...");
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'load'],
        timeout: 30000
      });

      console.log("Generating PDF...");
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: false,
      });

      console.log("PDF generated, size:", pdf.length, "bytes");
      await browser.close();

      if (pdf.length < 100) {
        throw new Error("Generated PDF is too small, likely corrupted");
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      res.setHeader('Content-Length', pdf.length.toString());
      res.end(pdf, 'binary');
    } catch (error) {
      console.error("PDF generation error:", error);
      if (browser) {
        await browser.close().catch(() => {});
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "PDF generation failed"
      });
    }
  });

  return httpServer;
}

function generateProposalHTML(proposal: any): string {
  const { sections, designSettings, clientName, title } = proposal;
  const { primaryColor, secondaryColor, accentColor, logoUrl, companyName, fontFamily } = designSettings;

  const getFontStack = () => {
    switch (fontFamily) {
      case 'inter': return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
      case 'outfit': return "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
      default: return "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
    }
  };

  const renderSection = (section: any): string => {
    switch (section.type) {
      case 'cover':
        return `
          <div class="page cover-page" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);">
            ${logoUrl ? `<img src="${logoUrl}" class="cover-logo" alt="Logo" />` : ''}
            <div class="cover-company">${companyName.toLowerCase()}</div>
            <div class="cover-content">
              <h1 class="cover-title">${section.title}</h1>
              ${section.subtitle ? `<p class="cover-subtitle">${section.subtitle}</p>` : ''}
            </div>
            <div class="cover-footer">
              <div class="cover-line"></div>
              <p class="cover-client">Proposal for ${clientName}</p>
            </div>
            <div class="accent-bar" style="background: ${accentColor};"></div>
          </div>
        `;

      case 'project-summary':
      case 'approach':
        return `
          <div class="page content-page">
            <div class="section-header">
              <h2 style="color: ${secondaryColor};">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></div>
            </div>
            <div class="content-text">${section.content || ''}</div>
          </div>
        `;

      case 'deliverables':
        const deliverables = section.deliverableItems || [];
        return `
          <div class="page content-page">
            <div class="section-header">
              <h2 style="color: ${secondaryColor};">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></div>
            </div>
            <div class="deliverables-list">
              ${deliverables.map((phase: any, index: number) => `
                <div class="deliverable-phase">
                  <h3 style="color: ${secondaryColor};">
                    <span class="phase-number" style="background: ${primaryColor};">${index + 1}</span>
                    ${phase.title}
                  </h3>
                  <ul>
                    ${phase.items.map((item: string) => `
                      <li>
                        <span class="bullet" style="background: ${primaryColor};"></span>
                        ${item}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      case 'timeline':
        const timelineItems = section.timelineItems || [];
        return `
          <div class="page content-page">
            <div class="section-header">
              <h2 style="color: ${secondaryColor};">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></div>
            </div>
            <div class="timeline">
              <div class="timeline-line" style="background: ${primaryColor}30;"></div>
              ${timelineItems.map((item: any) => `
                <div class="timeline-item">
                  <div class="timeline-dot" style="border-color: ${primaryColor};"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-period" style="background: ${primaryColor};">${item.period}</span>
                      <h4 style="color: ${secondaryColor};">${item.title}</h4>
                    </div>
                    <p>${item.description}</p>
                    ${item.items && item.items.length > 0 ? `
                      <ul class="timeline-subitems">
                        ${item.items.map((subItem: string) => `
                          <li>
                            <span class="mini-bullet" style="background: ${accentColor};"></span>
                            ${subItem}
                          </li>
                        `).join('')}
                      </ul>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      case 'why-choose-us':
        const features = section.featureItems || [];
        return `
          <div class="page dark-page" style="background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor}dd 100%);">
            <div class="section-header light">
              <h2>${section.title}</h2>
              <div class="header-line" style="background: ${accentColor};"></div>
            </div>
            <div class="features-grid">
              ${features.map((feature: any) => `
                <div class="feature-item">
                  <div class="feature-number">${feature.number}</div>
                  <div class="feature-content">
                    <h4>${feature.title}</h4>
                    <p>${feature.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      case 'pricing':
        const terms = section.termItems || [];
        return `
          <div class="page content-page">
            <div class="section-header">
              <h2 style="color: ${secondaryColor};">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></div>
            </div>
            <div class="terms-list">
              ${terms.map((term: any) => `
                <div class="term-item">
                  <h4 style="color: ${secondaryColor};">${term.title}</h4>
                  <div class="term-content" style="border-color: ${primaryColor}40;">
                    ${term.content.replace(/\n/g, '<br>')}
                  </div>
                </div>
              `).join('')}
            </div>
            ${section.totalAmount ? `
              <div class="total-box" style="background: ${primaryColor}10;">
                <span class="total-label">Total Investment</span>
                <span class="total-amount" style="color: ${primaryColor};">${section.totalAmount}</span>
              </div>
            ` : ''}
          </div>
        `;

      case 'next-steps':
        const steps = section.nextStepItems || [];
        const requirements = section.items || [];
        return `
          <div class="page content-page">
            <div class="section-header">
              <h2 style="color: ${secondaryColor};">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></div>
            </div>
            <div class="next-steps-section">
              <h4 style="color: ${secondaryColor};">Getting Started</h4>
              <div class="steps-list">
                ${steps.map((step: any, index: number) => `
                  <div class="step-item">
                    <span class="step-number" style="background: ${primaryColor};">${index + 1}</span>
                    <div class="step-content">
                      <strong style="color: ${secondaryColor};">${step.step}:</strong>
                      ${step.description}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ${requirements.length > 0 ? `
              <div class="requirements-section">
                <h4 style="color: ${secondaryColor};">What We Need From You</h4>
                <ul>
                  ${requirements.map((req: string) => `
                    <li>
                      <span class="bullet" style="background: ${primaryColor};"></span>
                      ${req}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;

      case 'contact':
        return `
          <div class="page contact-page" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);">
            <div class="section-header light">
              <h2>${section.title}</h2>
              <div class="header-line" style="background: ${accentColor};"></div>
            </div>
            <p class="contact-intro">Our team is ready to bring your vision to life. We're excited about the opportunity to work together.</p>
            <div class="contact-grid">
              <div class="contact-details">
                <p class="contact-name">${section.contactName || ''}</p>
                <p class="contact-title">${section.contactTitle || ''}</p>
                <p class="contact-info">${section.contactPhone || ''}</p>
                <p class="contact-info">${section.contactEmail || ''}</p>
              </div>
              <div class="contact-closing">
                <p class="closing-message">${section.closingMessage || ''}</p>
                ${logoUrl ? `<img src="${logoUrl}" class="contact-logo" alt="Logo" />` : ''}
              </div>
            </div>
            <div class="accent-bar bottom" style="background: ${accentColor};"></div>
          </div>
        `;

      default:
        return '';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${getFontStack()};
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 50px 60px;
          page-break-after: always;
          position: relative;
        }
        
        .page:last-child {
          page-break-after: avoid;
        }
        
        /* Cover Page */
        .cover-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 60px;
        }
        
        .cover-logo {
          position: absolute;
          top: 40px;
          right: 50px;
          max-width: 100px;
          max-height: 50px;
          object-fit: contain;
        }
        
        .cover-company {
          position: absolute;
          top: 40px;
          left: 50px;
          color: rgba(255,255,255,0.8);
          font-size: 12pt;
          font-weight: 500;
          letter-spacing: 2px;
        }
        
        .cover-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .cover-title {
          font-size: 42pt;
          font-weight: 700;
          color: white;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }
        
        .cover-subtitle {
          font-size: 16pt;
          color: rgba(255,255,255,0.8);
        }
        
        .cover-footer {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }
        
        .cover-line {
          width: 60px;
          height: 2px;
          background: rgba(255,255,255,0.3);
          margin: 0 auto 20px;
        }
        
        .cover-client {
          color: rgba(255,255,255,0.6);
          font-size: 10pt;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        .accent-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        
        .accent-bar.bottom {
          bottom: 0;
        }
        
        /* Content Pages */
        .content-page {
          background: white;
        }
        
        .section-header {
          margin-bottom: 30px;
        }
        
        .section-header h2 {
          font-size: 22pt;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .section-header.light h2 {
          color: white;
        }
        
        .header-line {
          width: 60px;
          height: 4px;
          border-radius: 2px;
        }
        
        .content-text {
          color: #555;
          font-size: 11pt;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        
        /* Deliverables */
        .deliverables-list {
          margin-top: 20px;
        }
        
        .deliverable-phase {
          margin-bottom: 30px;
        }
        
        .deliverable-phase h3 {
          font-size: 14pt;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .phase-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12pt;
          font-weight: 700;
        }
        
        .deliverables-list ul {
          list-style: none;
          padding-left: 40px;
        }
        
        .deliverables-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
          color: #555;
        }
        
        .bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
        }
        
        /* Timeline */
        .timeline {
          position: relative;
          padding-left: 40px;
        }
        
        .timeline-line {
          position: absolute;
          left: 16px;
          top: 8px;
          bottom: 8px;
          width: 2px;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 30px;
          padding-left: 30px;
        }
        
        .timeline-dot {
          position: absolute;
          left: -30px;
          top: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 4px solid;
          background: white;
        }
        
        .timeline-header {
          display: flex;
          align-items: baseline;
          gap: 15px;
          margin-bottom: 8px;
        }
        
        .timeline-period {
          font-size: 9pt;
          font-weight: 700;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
        }
        
        .timeline-header h4 {
          font-size: 14pt;
          font-weight: 600;
        }
        
        .timeline-item p {
          color: #666;
          font-size: 10pt;
        }
        
        .timeline-subitems {
          list-style: none;
          margin-top: 10px;
        }
        
        .timeline-subitems li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 9pt;
          margin-bottom: 4px;
        }
        
        .mini-bullet {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }
        
        /* Dark Pages (Why Choose Us) */
        .dark-page {
          color: white;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 30px;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .feature-number {
          font-size: 36pt;
          font-weight: 700;
          opacity: 0.2;
          line-height: 1;
        }
        
        .feature-content {
          padding-top: 8px;
        }
        
        .feature-content h4 {
          font-size: 10pt;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .feature-content p {
          font-size: 9pt;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }
        
        /* Terms */
        .terms-list {
          margin-top: 20px;
        }
        
        .term-item {
          margin-bottom: 20px;
        }
        
        .term-item h4 {
          font-size: 12pt;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .term-content {
          color: #666;
          font-size: 10pt;
          padding-left: 15px;
          border-left: 2px solid;
        }
        
        .total-box {
          margin-top: 30px;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .total-label {
          display: block;
          font-size: 10pt;
          color: #666;
        }
        
        .total-amount {
          display: block;
          font-size: 24pt;
          font-weight: 700;
          margin-top: 5px;
        }
        
        /* Next Steps */
        .next-steps-section h4,
        .requirements-section h4 {
          font-size: 12pt;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .steps-list {
          margin-bottom: 30px;
        }
        
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10pt;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .step-content {
          color: #666;
          font-size: 10pt;
        }
        
        .requirements-section ul {
          list-style: none;
        }
        
        .requirements-section li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
          color: #666;
          font-size: 10pt;
        }
        
        /* Contact Page */
        .contact-page {
          display: flex;
          flex-direction: column;
        }
        
        .contact-intro {
          color: rgba(255,255,255,0.8);
          font-size: 10pt;
          max-width: 400px;
          margin-bottom: 40px;
        }
        
        .contact-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex: 1;
          padding-bottom: 40px;
        }
        
        .contact-details {
          color: white;
        }
        
        .contact-name {
          font-size: 14pt;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .contact-title,
        .contact-info {
          font-size: 10pt;
          color: rgba(255,255,255,0.7);
        }
        
        .contact-closing {
          text-align: right;
        }
        
        .closing-message {
          font-size: 14pt;
          font-weight: 700;
          color: white;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        
        .contact-logo {
          max-width: 80px;
          max-height: 40px;
          object-fit: contain;
          opacity: 0.8;
        }
        
        @media print {
          .page {
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
      ${sections.map(renderSection).join('')}
    </body>
    </html>
  `;
}
