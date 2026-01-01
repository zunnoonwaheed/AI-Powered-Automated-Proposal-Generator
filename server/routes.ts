import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer from "puppeteer";
import { analyzeRequirementsSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

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

      const { text, strategicQuestions } = analyzeRequirementsSchema.parse(req.body);

      // Build additional context from strategic questions
      let additionalContext = "";
      if (strategicQuestions) {
        const contextParts = [];
        if (strategicQuestions.projectGoal) contextParts.push(`Project Goal: ${strategicQuestions.projectGoal}`);
        if (strategicQuestions.keyDeliverables) contextParts.push(`Expected Deliverables: ${strategicQuestions.keyDeliverables}`);
        if (strategicQuestions.budget) contextParts.push(`Budget Range: ${strategicQuestions.budget}`);
        if (strategicQuestions.timeline) contextParts.push(`Timeline: ${strategicQuestions.timeline}`);
        if (strategicQuestions.targetAudience) contextParts.push(`Target Audience: ${strategicQuestions.targetAudience}`);
        if (strategicQuestions.successCriteria) contextParts.push(`Success Criteria: ${strategicQuestions.successCriteria}`);
        if (strategicQuestions.constraints) contextParts.push(`Constraints/Requirements: ${strategicQuestions.constraints}`);

        if (contextParts.length > 0) {
          additionalContext = `\n\n=== STRATEGIC INFORMATION ===\n${contextParts.join('\n')}\n\nPlease use this information to generate more accurate and tailored proposal content, especially for deliverables, timeline, pricing, and approach sections.`;
        }
      }

      const systemPrompt = `You are an expert proposal writer and business analyst for Kayi Digital, a premium digital agency. Analyze the provided project requirements and extract key information to help generate a professional proposal.

IMPORTANT: Pay special attention to the Strategic Information section which contains critical details about budget, timeline, and client priorities. Use this information to create accurate and tailored content.

Return a JSON object with the following structure:
{
  "projectName": "Name of the project",
  "clientName": "Client name if mentioned, or 'Client' as default",
  "summary": "A professional 2-3 paragraph summary of the project scope, objectives, and expected outcomes. Reference the project goal if provided.",
  "deliverables": [
    {
      "title": "Phase or category name",
      "items": ["Deliverable 1", "Deliverable 2", ...]
    }
  ],
  "timeline": [
    {
      "period": "Time period based on the timeline provided (e.g., 'Week 1-2', 'Month 1')",
      "title": "Phase name",
      "description": "Brief description of activities"
    }
  ],
  "suggestedApproach": "A paragraph describing the recommended approach and methodology. Consider the target audience and success criteria if provided.",
  "keyRequirements": ["Requirement 1", "Requirement 2", ...],
  "suggestedTerms": [
    {
      "title": "Investment & Payment",
      "content": "If budget is provided, create payment terms. Example: 'Total Investment: [amount]\\n• 50% due upon contract signing\\n• 50% due at project milestone'. If no budget, use 'To be discussed based on final scope.'"
    },
    {
      "title": "Scope & Timeline",
      "content": "Based on deliverables and timeline provided"
    },
    {
      "title": "Revisions",
      "content": "Standard revision policy (2-3 rounds included, additional at hourly rate)"
    }
  ],
  "totalAmount": "If budget range provided, use the midpoint or suggest amount. Otherwise leave as 'TBD'",
  "pricingTableRows": [
    {
      "service": "Service name (e.g., 'Website Development', 'Design Services')",
      "description": "What's included/delivered (e.g., '3-page responsive website with SEO optimization', '3 concepts + 3 revision rounds')",
      "investment": "Price amount (e.g., 'Rs 50,000') or 'Included' if part of package"
    },
    ... (5-8 rows total, with the LAST row always being the total)
    {
      "service": "Total Investment",
      "description": "Complete package summary",
      "investment": "Rs X,XXX (total amount from totalAmount field)"
    }
  ],
  "nextStepItems": [
    {
      "step": "Step title (e.g., 'Discovery Call', 'Proposal Review', 'Contract Signing', 'Project Kickoff', 'Launch')",
      "description": "Brief description of what happens in this step (e.g., 'Initial consultation to understand your needs', 'Review and approve the proposal')"
    }
    ... (3-5 steps total, representing the onboarding process from first contact to project completion)
  ]
}

IMPORTANT GUIDELINES:
- For pricingTableRows: Break down the total investment into 5-8 line items showing individual services/phases and their costs. Use "Included" for items that are part of the package. The LAST row must always be "Total Investment" with the total amount.
- For nextStepItems: Create 3-5 steps that outline the onboarding journey from initial contact to project launch. Common steps: Discovery Call, Proposal Review, Contract Signing, Initial Payment, Project Kickoff, Development/Work Phase, Final Review, Launch.
- Ensure pricing table rows add up to the totalAmount.

Be professional, thorough, and create content that would be suitable for a high-end agency proposal. Use the strategic information to make the proposal as accurate and tailored as possible.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze the following project requirements and generate proposal content:\n\n${text}${additionalContext}`,
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
          suggestedTerms: analysisData.suggestedTerms || [],
          totalAmount: analysisData.totalAmount || undefined,
          pricingTableRows: analysisData.pricingTableRows || undefined,
          nextStepItems: analysisData.nextStepItems || undefined,
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
          suggestedTerms: [],
          totalAmount: undefined,
          pricingTableRows: undefined,
          nextStepItems: undefined,
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

function generateCircularLogoSVG(centerText: string, companyName: string, primaryColor: string): string {
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

  const size = 680;
  const padding = 200;
  const viewBoxSize = size + (padding * 2);
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const outerRadius = (size / 2) - 15;
  const innerRadius = size / 7;
  const segmentCount = segmentData.length;
  const anglePerSegment = (2 * Math.PI) / segmentCount;

  const colors = ['#E5E5E5', primaryColor, '#2C2C2C', primaryColor];

  // Helper to create arc path
  const createArcPath = (startAngle: number, endAngle: number) => {
    const startOuterX = centerX + outerRadius * Math.cos(startAngle);
    const startOuterY = centerY + outerRadius * Math.sin(startAngle);
    const endOuterX = centerX + outerRadius * Math.cos(endAngle);
    const endOuterY = centerY + outerRadius * Math.sin(endAngle);
    const startInnerX = centerX + innerRadius * Math.cos(endAngle);
    const startInnerY = centerY + innerRadius * Math.sin(endAngle);
    const endInnerX = centerX + innerRadius * Math.cos(startAngle);
    const endInnerY = centerY + innerRadius * Math.sin(startAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${startOuterX} ${startOuterY}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
            L ${startInnerX} ${startInnerY}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY} Z`;
  };

  const segments = segmentData.map((segment, index) => {
    const startAngle = -Math.PI / 2 + anglePerSegment * index;
    const endAngle = startAngle + anglePerSegment;
    const midAngle = startAngle + anglePerSegment / 2;
    const textRadius = (outerRadius + innerRadius) / 2;
    const textX = centerX + textRadius * Math.cos(midAngle);
    const textY = centerY + textRadius * Math.sin(midAngle);
    const color = colors[index % colors.length];
    const isLight = color === '#E5E5E5';
    const textColor = isLight ? '#000' : '#fff';
    const descColor = isLight ? '#444' : 'rgba(255,255,255,0.95)';

    return `
      <path d="${createArcPath(startAngle, endAngle)}" fill="${color}" stroke="#fff" stroke-width="3"/>
      <text x="${textX}" y="${textY - 50}" text-anchor="middle" dominant-baseline="middle"
            fill="${textColor}" font-size="48" font-weight="bold" font-family="Arial, sans-serif">
        ${segment.number}
      </text>
      ${segment.title.split('\n').map((line, i) => `
        <text x="${textX}" y="${textY - 15 + i * 18}" text-anchor="middle" dominant-baseline="middle"
              fill="${textColor}" font-size="16" font-weight="bold" font-family="Arial, sans-serif" letter-spacing="1.2">
          ${line}
        </text>
      `).join('')}
      ${segment.description.split('\n').map((line, i) => `
        <text x="${textX}" y="${textY + 40 + i * 15}" text-anchor="middle" dominant-baseline="middle"
              fill="${descColor}" font-size="13" font-family="Arial, sans-serif">
          ${line}
        </text>
      `).join('')}
    `;
  }).join('');

  return `
    <svg width="100%" height="600" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"
         preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
      <defs>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="50%" stop-color="#000"/>
          <stop offset="100%" stop-color="${primaryColor}"/>
        </linearGradient>
      </defs>
      ${segments}
      <circle cx="${centerX}" cy="${centerY}" r="${innerRadius + 12}" fill="#fff"
              stroke="url(#borderGradient)" stroke-width="8"/>
      <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="#fff"/>
      ${centerText.split('\n').map((line, i) => `
        <text x="${centerX}" y="${centerY - 22 + i * 20}" text-anchor="middle" dominant-baseline="middle"
              font-size="18" font-weight="bold" fill="#000" font-family="Arial, sans-serif">
          ${line}
        </text>
      `).join('')}
      <text x="${centerX}" y="${centerY + 2}" text-anchor="middle" dominant-baseline="middle"
            font-size="22" font-weight="bold" fill="${primaryColor}" font-family="Arial, sans-serif">
        ${companyName}
      </text>
      <text x="${centerX}" y="${centerY + 28}" text-anchor="middle" dominant-baseline="middle"
            font-size="14" font-weight="bold" fill="#000" font-family="Arial, sans-serif">
        OVER OTHERS
      </text>
    </svg>
  `;
}

function generateProposalHTML(proposal: any): string {
  const { sections, designSettings, clientName, title } = proposal;
  const { primaryColor, secondaryColor, accentColor, backgroundColor, logoUrl, clientLogoUrl, companyName, fontFamily } = designSettings;

  // Determine if background is dark
  const bgColor = backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase() === '#000000' || bgColor.toLowerCase() === '#000' || bgColor.toLowerCase() === 'black';
  const textColor = isDarkBg ? '#ffffff' : '#555';
  const headingColor = isDarkBg ? '#ffffff' : secondaryColor;

  // Load footer image as base64 for Contact page only
  let footerImageBase64 = '';
  try {
    const footerPath = path.join(process.cwd(), 'client', 'public', 'footer.png');
    if (fs.existsSync(footerPath)) {
      const footerBuffer = fs.readFileSync(footerPath);
      footerImageBase64 = `data:image/png;base64,${footerBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading footer image:', error);
  }

  const getFontStack = () => {
    switch (fontFamily) {
      case 'inter': return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
      case 'outfit': return "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
      default: return "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
    }
  };

  // Group sections into pages (2 sections per page, except special sections)
  const pages: any[][] = [];
  sections.forEach((section: any) => {
    if (section.type === 'cover' || section.type === 'contact' || section.type === 'why-choose-us') {
      // These sections get their own page
      pages.push([section]);
    } else {
      // Group other sections in pairs
      const lastPage = pages[pages.length - 1];
      if (lastPage && lastPage.length === 1 &&
          lastPage[0].type !== 'cover' &&
          lastPage[0].type !== 'contact' &&
          lastPage[0].type !== 'why-choose-us') {
        // Add to existing page if it has only 1 section
        lastPage.push(section);
      } else {
        // Start new page
        pages.push([section]);
      }
    }
  });

  const renderSection = (section: any): string => {
    switch (section.type) {
      case 'cover':
        return `
          <div class="page cover-page" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);">
            ${logoUrl ? `<img src="${logoUrl}" class="cover-logo" alt="Kayi Digital Logo" />` : ''}
            ${clientLogoUrl ? `<img src="${clientLogoUrl}" class="client-logo" alt="Client Logo" />` : ''}
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
          <div class="section-wrapper" style="margin: 0; padding: 30px 50px; background-color: ${bgColor};">
            <div class="section-header" style="margin-bottom: 15px;">
              <h2 style="color: ${headingColor}; font-size: 20pt; margin-bottom: 10px; margin-top: 0;">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); width: 50px; height: 3px;"></div>
            </div>
            <div class="content-text" style="font-size: 10pt; line-height: 1.6; margin: 0; color: ${textColor};">${section.content || ''}</div>
          </div>
        `;

      case 'deliverables':
        const deliverables = section.deliverableItems || [];
        return `
          <div class="section-wrapper" style="margin: 0; padding: 30px 50px; background-color: ${bgColor};">
            <div class="section-header" style="margin-bottom: 15px;">
              <h2 style="color: ${headingColor}; font-size: 18pt; margin-bottom: 8px; margin-top: 0;">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); width: 50px; height: 3px;"></div>
            </div>
            <div class="deliverables-list" style="margin-top: 10px; margin-bottom: 0;">
              ${deliverables.map((phase: any, index: number) => `
                <div class="deliverable-phase" style="margin-bottom: 12px;">
                  <h3 style="color: ${headingColor}; font-size: 11pt; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                    <span class="phase-number" style="background: ${primaryColor}; width: 22px; height: 22px; font-size: 10pt;">${index + 1}</span>
                    ${phase.title}
                  </h3>
                  <ul style="list-style: none; padding-left: 30px;">
                    ${phase.items.map((item: string) => `
                      <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; color: ${textColor}; font-size: 8.5pt; line-height: 1.4;">
                        <span class="bullet" style="background: ${primaryColor}; width: 4px; height: 4px; margin-top: 5px;"></span>
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
          <div class="section-wrapper" style="margin: 0; padding: 30px 50px; background-color: ${bgColor};">
            <div class="section-header" style="margin-bottom: 15px;">
              <h2 style="color: ${headingColor}; font-size: 18pt; margin-bottom: 8px; margin-top: 0;">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); width: 50px; height: 3px;"></div>
            </div>
            <div style="margin-top: 24px; padding-bottom: 0;">
              <div style="display: flex; flex-direction: column; gap: 0;">
                ${timelineItems.slice(0, 5).map((item: any, index: number) => `
                  <div style="display: flex; gap: 16px; position: relative;">
                    <!-- Timeline Line & Dot -->
                    <div style="display: flex; flex-direction: column; align-items: center; width: 40px; position: relative;">
                      <!-- Dot/Circle -->
                      <div style="
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background-color: ${primaryColor};
                        border: 3px solid ${bgColor};
                        box-shadow: 0 0 0 2px ${primaryColor};
                        z-index: 2;
                        margin-top: 4px;
                        flex-shrink: 0;
                      "></div>
                      <!-- Vertical Line -->
                      ${index < timelineItems.slice(0, 5).length - 1 ? `
                        <div style="
                          width: 3px;
                          flex: 1;
                          background-color: ${primaryColor}40;
                          margin-top: 4px;
                          margin-bottom: 4px;
                          min-height: 40px;
                        "></div>
                      ` : ''}
                    </div>

                    <!-- Content -->
                    <div style="
                      flex: 1;
                      padding: 14px 16px;
                      background-color: ${isDarkBg ? '#1a1a1a' : `${primaryColor}06`};
                      border: 1px solid ${primaryColor}12;
                      border-radius: 8px;
                      margin-bottom: 12px;
                    ">
                      <!-- Period -->
                      <div style="
                        font-size: 8.5pt;
                        font-weight: 700;
                        color: ${primaryColor};
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 6px;
                      ">
                        ${item.period}
                      </div>
                      <!-- Title -->
                      <h4 style="
                        font-size: 12pt;
                        font-weight: 700;
                        color: ${headingColor};
                        margin-bottom: 5px;
                        line-height: 1.3;
                      ">
                        ${item.title}
                      </h4>
                      <!-- Description -->
                      <p style="
                        font-size: 10pt;
                        color: ${isDarkBg ? '#cccccc' : '#666'};
                        line-height: 1.6;
                        margin-bottom: 0;
                      ">
                        ${item.description}
                      </p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;

      case 'why-choose-us':
        const features = section.featureItems || [];
        // Use default stats if not provided
        const stats = section.statItems || [
          { id: '1', value: "500+", label: "Projects Delivered" },
          { id: '2', value: "98%", label: "Client Satisfaction" },
          { id: '3', value: "10+", label: "Years Experience" },
          { id: '4', value: "24/7", label: "Support Available" },
        ];

        // Check if circular logo is enabled
        if (section.useCircularLogo) {
          const centerCompanyName = section.companyName || companyName || "";
          const centerText = section.centerText || "WHY CHOOSE";

          // Generate circular logo SVG
          const circularLogoSVG = generateCircularLogoSVG(centerText, centerCompanyName, primaryColor);

          return `
            <div class="page content-page" style="padding: 40px 50px; background: ${bgColor}; min-height: 297mm; max-height: 297mm;">
              <div style="margin-bottom: 35px;">
                <h2 style="color: ${headingColor}; font-size: 22pt; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px;">
                  ${section.title}
                </h2>
                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); border-radius: 2px;"></div>
              </div>

              <div style="display: flex; justify-content: center; align-items: center; margin: 40px 0 60px 0;">
                ${circularLogoSVG}
              </div>

              ${stats.length > 0 ? `
                <div style="margin-top: -80px; padding-top: 0; padding-bottom: 10px;">
                  <div style="
                    background-color: ${primaryColor}08;
                    border-radius: 12px;
                    padding: 24px 32px;
                    border: 1px solid ${primaryColor}15;
                  ">
                    <h3 style="
                      font-size: 11pt;
                      font-weight: 700;
                      text-align: center;
                      margin-bottom: 20px;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      color: ${headingColor};
                      opacity: 0.85;
                    ">
                      By The Numbers
                    </h3>
                    <div style="
                      display: grid;
                      grid-template-columns: repeat(${Math.min(stats.length, 4)}, 1fr);
                      gap: 32px;
                    ">
                      ${stats.map((stat: any) => `
                        <div style="text-align: center; padding: 8px 0;">
                          <div style="
                            font-size: 24pt;
                            font-weight: 700;
                            line-height: 1;
                            color: ${primaryColor};
                            margin-bottom: 8px;
                          ">
                            ${stat.value}
                          </div>
                          <p style="
                            color: #777;
                            font-size: 8pt;
                            line-height: 1.4;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin: 0;
                          ">
                            ${stat.label}
                          </p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }

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
        const tableRows = section.pricingTableRows || [];
        return `
          <div class="section-wrapper" style="margin: 0; padding: 30px 50px; background-color: ${bgColor};">
            <div class="section-header" style="margin-bottom: 15px;">
              <h2 style="color: ${headingColor}; font-size: 18pt; margin-bottom: 8px; margin-top: 0;">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); width: 50px; height: 3px;"></div>
            </div>
            ${tableRows.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1.5px solid ${primaryColor};">
                <thead>
                  <tr style="background-color: ${primaryColor}12; border-bottom: 1.5px solid ${primaryColor};">
                    <th style="padding: 8px 10px; text-align: left; font-size: 9pt; font-weight: 600; color: ${headingColor}; border-right: 1px solid ${primaryColor}35; width: 28%;">
                      ${section.tableHeaders?.service || 'Service Component'}
                    </th>
                    <th style="padding: 8px 10px; text-align: left; font-size: 9pt; font-weight: 600; color: ${headingColor}; border-right: 1px solid ${primaryColor}35; width: 48%;">
                      ${section.tableHeaders?.description || 'What You Get'}
                    </th>
                    <th style="padding: 8px 10px; text-align: center; font-size: 9pt; font-weight: 600; color: ${headingColor}; width: 24%;">
                      ${section.tableHeaders?.investment || 'Investment'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.map((row: any, index: number) => {
                    const isTotal = index === tableRows.length - 1 && row.service.toLowerCase().includes('total');
                    return `
                      <tr style="background-color: ${isTotal ? `${primaryColor}06` : 'transparent'}; border-bottom: 1px solid ${primaryColor}20;">
                        <td style="padding: 7px 10px; font-size: ${isTotal ? '10pt' : '8.5pt'}; font-weight: ${isTotal ? '700' : '500'}; color: ${headingColor}; border-right: 1px solid ${primaryColor}20; line-height: 1.3;">
                          ${row.service}
                        </td>
                        <td style="padding: 7px 10px; font-size: 8.5pt; color: ${textColor}; border-right: 1px solid ${primaryColor}20; line-height: 1.3;">
                          ${row.description}
                        </td>
                        <td style="padding: 7px 10px; text-align: center; font-size: ${isTotal ? '12pt' : '9pt'}; font-weight: ${isTotal ? '700' : '600'}; color: ${isTotal ? primaryColor : textColor};">
                          ${row.investment}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              ${section.paymentTerms ? `
                <div style="border-left: 2.5px solid ${primaryColor}; padding-left: 10px; margin-top: 10px; color: ${isDarkBg ? '#cccccc' : '#666'}; font-size: 8.5pt; font-style: italic; line-height: 1.4;">
                  ${section.paymentTerms}
                </div>
              ` : ''}
            ` : `
              <div class="terms-list">
                ${terms.map((term: any) => `
                  <div class="term-item">
                    <h4 style="color: ${headingColor};">${term.title}</h4>
                    <div class="term-content" style="border-color: ${primaryColor}40; color: ${textColor};">
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
            `}
          </div>
        `;

      case 'next-steps':
        const steps = section.nextStepItems || [];
        const requirements = section.items || [];
        return `
          <div class="section-wrapper" style="margin: 0; padding: 30px 50px; background-color: ${bgColor};">
            <div class="section-header" style="margin-bottom: 15px;">
              <h2 style="color: ${headingColor}; font-size: 18pt; margin-bottom: 8px; margin-top: 0;">${section.title}</h2>
              <div class="header-line" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); width: 50px; height: 3px;"></div>
            </div>
            ${steps.length > 0 ? `
              <div style="
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin-top: 12px;
              ">
                ${steps.map((step: any, index: number) => {
                  const isLast = index === steps.length - 1;
                  return `
                    <div style="
                      position: relative;
                      padding: 12px 8px;
                      border-radius: 8px;
                      background-color: ${isLast ? primaryColor : (isDarkBg ? '#1a1a1a' : '#fff')};
                      border: ${isLast ? 'none' : `1.5px solid ${primaryColor}12`};
                      box-shadow: ${isLast ? `0 3px 12px ${primaryColor}30` : '0 1px 4px rgba(0,0,0,0.03)'};
                      text-align: center;
                    ">
                      <!-- Step Number Badge -->
                      <div style="
                        width: 26px;
                        height: 26px;
                        border-radius: 50%;
                        background-color: ${isLast ? 'rgba(255,255,255,0.25)' : primaryColor};
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11pt;
                        font-weight: bold;
                        margin: 0 auto 8px;
                        box-shadow: ${isLast ? '0 2px 4px rgba(0,0,0,0.1)' : `0 2px 4px ${primaryColor}20`};
                      ">
                        ${index + 1}
                      </div>

                      <!-- Step Title -->
                      <h4 style="
                        font-size: 8.5pt;
                        font-weight: 700;
                        color: ${isLast ? 'white' : headingColor};
                        line-height: 1.2;
                        text-transform: uppercase;
                        letter-spacing: 0.2px;
                        margin: 6px 0;
                        padding: 0 2px;
                        min-height: 20px;
                      ">
                        ${step.step}
                      </h4>

                      <!-- Step Description -->
                      <p style="
                        font-size: 7pt;
                        color: ${isLast ? 'rgba(255,255,255,0.9)' : (isDarkBg ? '#cccccc' : '#666')};
                        line-height: 1.3;
                        margin: 0;
                        padding: 0 2px;
                        min-height: 36px;
                      ">
                        ${step.description}
                      </p>

                      ${!isLast ? `
                        <div style="
                          position: absolute;
                          right: -6px;
                          top: 50%;
                          transform: translateY(-50%);
                          width: 0;
                          height: 0;
                          border-top: 6px solid transparent;
                          border-bottom: 6px solid transparent;
                          border-left: 6px solid ${primaryColor}20;
                          z-index: 1;
                        "></div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `;

      case 'contact':
        const contactTextColor = isDarkBg ? '#ffffff' : secondaryColor;
        const contactLogoFilter = isDarkBg ? 'brightness(0) invert(1)' : 'none';

        return `
          <div class="page" style="background: ${bgColor}; position: relative; overflow: hidden; min-height: 297mm; max-height: 297mm; padding: 0;">
            <!-- Gradient Envelope Shape with Sharp Corner -->
            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 50%;" preserveAspectRatio="none" viewBox="0 0 1200 600">
              <defs>
                <linearGradient id="contactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${primaryColor}" />
                  <stop offset="35%" stop-color="${primaryColor}" />
                  <stop offset="100%" stop-color="${secondaryColor}" />
                </linearGradient>
                <linearGradient id="contactGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M 0 0 L 1200 0 L 1200 500 L 300 600 L 0 480 Z" fill="url(#contactGradient)" />
              <path d="M 0 0 L 1200 0 L 1200 500 L 300 600 L 0 480 Z" fill="url(#contactGradient2)" />
            </svg>

            <!-- Content - Bottom Left -->
            <div style="position: absolute; bottom: 80px; left: 80px; z-index: 2;">
              <!-- Logo -->
              <div style="margin-bottom: 20px;">
                ${logoUrl ? `
                  <img src="${logoUrl}" alt="Company Logo" style="width: 75px; height: 75px; object-fit: contain; filter: ${contactLogoFilter};" />
                ` : `
                  <svg width="75" height="75" viewBox="0 0 75 75" fill="none">
                    <rect x="5" y="5" width="28" height="28" fill="${contactTextColor}" rx="3"/>
                    <rect x="42" y="5" width="28" height="28" fill="${contactTextColor}" rx="3"/>
                    <rect x="5" y="42" width="28" height="28" fill="${contactTextColor}" rx="3"/>
                    <rect x="42" y="42" width="28" height="28" fill="${contactTextColor}" rx="3"/>
                  </svg>
                `}
              </div>

              <!-- Company Name -->
              <h1 style="color: ${contactTextColor}; font-size: 42pt; font-weight: 700; line-height: 1.2; margin-bottom: 20px; letter-spacing: -0.8px;">
                ${companyName || 'Your Company'}
              </h1>

              <!-- Separator Line -->
              <div style="width: 320px; height: 3px; background: linear-gradient(90deg, ${primaryColor}, ${accentColor}); margin-bottom: 24px;"></div>

              <!-- Contact Info -->
              <div>
                <p style="color: ${contactTextColor}; font-size: 15pt; font-weight: 400; margin-bottom: 6px; letter-spacing: 0.2px;">
                  ${section.contactEmail || 'www.yourwebsite.com'}
                </p>
                <p style="color: ${contactTextColor}; font-size: 15pt; font-weight: 400; letter-spacing: 0.2px;">
                  ${section.contactPhone || '@yourhandle'}
                </p>
              </div>
            </div>
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
          color: ${textColor};
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          max-height: 297mm;
          padding: 50px 60px 70px 60px;
          page-break-after: always;
          position: relative;
          page-break-inside: avoid;
          box-sizing: border-box;
        }

        /* Multi-section pages use flex layout */
        .page.multi-section {
          padding: 0 0 70px 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
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
          left: 50px;
          max-width: 100px;
          max-height: 50px;
          object-fit: contain;
        }

        .client-logo {
          position: absolute;
          top: 40px;
          right: 50px;
          max-width: 100px;
          max-height: 50px;
          object-fit: contain;
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
          background: ${bgColor};
        }

        /* Section Wrapper - for grouped sections */
        .section-wrapper {
          background: ${bgColor};
          padding: 30px 50px;
          box-sizing: border-box;
          page-break-inside: avoid;
          flex: 0 0 auto;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 20pt;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .section-header.light h2 {
          color: white;
        }

        .header-line {
          width: 50px;
          height: 3px;
          border-radius: 2px;
        }

        .content-text {
          color: ${textColor};
          font-size: 10pt;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        /* Deliverables */
        .deliverables-list {
          margin-top: 15px;
        }

        .deliverable-phase {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .deliverable-phase h3 {
          font-size: 12pt;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .phase-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11pt;
          font-weight: 700;
        }

        .deliverables-list ul {
          list-style: none;
          padding-left: 35px;
        }

        .deliverables-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 6px;
          color: ${textColor};
          font-size: 9pt;
        }

        .bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 6px;
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
          page-break-inside: avoid;
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
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
          page-break-inside: avoid;
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
          page-break-inside: avoid;
        }
        
        .term-item h4 {
          font-size: 12pt;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .term-content {
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
          color: ${isDarkBg ? '#cccccc' : '#666'};
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
      ${pages.map(pageSections => {
        // If page has only one section
        if (pageSections.length === 1) {
          const section = pageSections[0];
          // Special sections render as full pages with their own styling
          if (section.type === 'cover' || section.type === 'contact' || section.type === 'why-choose-us') {
            return renderSection(section);
          }
          // Regular single sections get wrapped in a content page
          return `
            <div class="page content-page" style="background: ${bgColor};">
              ${renderSection(section)}
            </div>
          `;
        }
        // If page has multiple sections, wrap them in a multi-section page
        return `
          <div class="page content-page multi-section" style="background: ${bgColor};">
            ${pageSections.map(renderSection).join('')}
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;
}
