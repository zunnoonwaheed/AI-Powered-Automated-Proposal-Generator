import type { Proposal, ProposalSection, DesignSettings } from "@shared/schema";
import { nanoid } from "./utils";

export function createDefaultProposal(): Proposal {
  return {
    id: nanoid(),
    title: "Project Proposal",
    clientName: "Client Name",
    sections: [
      createSection("cover", "LET'S GROW TOGETHER.", ""),
      createSection("project-summary", "Project Summary", "Enter your project summary here. Describe the scope, objectives, and key outcomes of the project."),
      createSection("deliverables", "Project Deliverables", ""),
      createSection("approach", "Creative Concept & Approach", "Our research-driven approach ensures your content resonates with target audiences and stands out in the market."),
      createSection("timeline", "Implementation Timeline", ""),
      createSection("why-choose-us", "Why Choose Us?", ""),
      createSection("pricing", "Terms & Conditions", ""),
      createSection("next-steps", "Next Steps & Project Onboarding", ""),
      createSection("contact", "Contact", ""),
    ],
    designSettings: createDefaultDesignSettings(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createSection(type: ProposalSection["type"], title: string, content: string): ProposalSection {
  const baseSection = {
    id: nanoid(),
    type,
    title,
    content,
  };

  switch (type) {
    case "deliverables":
      return {
        ...baseSection,
        deliverableItems: [
          {
            id: nanoid(),
            title: "Phase 1: Foundation",
            items: [
              "Market research and competitor analysis",
              "Brand positioning document",
              "Complete brand kit (logo, colors, typography)",
              "Brand voice and messaging framework",
            ],
          },
          {
            id: nanoid(),
            title: "Phase 2: Content Creation",
            items: [
              "12 Instagram posts introducing your brand",
              "4 professionally edited Reels",
              "4 Instagram Stories",
              "Content calendar and hashtag strategy",
            ],
          },
        ],
      };
    case "timeline":
      return {
        ...baseSection,
        timelineItems: [
          {
            id: nanoid(),
            period: "Days 1-10",
            title: "Foundation Phase",
            description: "Initial consultation, brand positioning, and photography",
            items: ["Client onboarding", "Brand positioning document", "Product photography"],
          },
          {
            id: nanoid(),
            period: "Weeks 1-4",
            title: "Content Phase",
            description: "Script development, content creation, and publishing",
            items: ["Weekly content publishing", "Engagement optimization"],
          },
        ],
      };
    case "why-choose-us":
      return {
        ...baseSection,
        featureItems: [
          {
            id: nanoid(),
            number: "01",
            title: "PROVEN ROI ACCELERATION",
            description: "We make brands impossible to ignore. Your growth becomes our legacy.",
          },
          {
            id: nanoid(),
            number: "02",
            title: "FULL-SPECTRUM CREATIVE POWERHOUSE",
            description: "We don't make ads, we craft experiences. From CGI magic to viral content that converts.",
          },
          {
            id: nanoid(),
            number: "03",
            title: "STRATEGIC PARTNERSHIP APPROACH",
            description: "We succeed when you dominate. Your competitors become our case studies.",
          },
          {
            id: nanoid(),
            number: "04",
            title: "CUTTING-EDGE TECHNOLOGY & INSIGHTS",
            description: "While others catch up, we stay ahead. Next-gen strategies for tomorrow's market.",
          },
        ],
      };
    case "pricing":
      return {
        ...baseSection,
        title: "Terms & Conditions",
        termItems: [
          {
            id: nanoid(),
            title: "Investment & Payment",
            content: "Total Month 1: Rs. 115,000\n• Rs. 72,500 due upon contract signing\n• Rs. 42,500 due December 20th, 2025",
          },
          {
            id: nanoid(),
            title: "Scope & Timeline",
            content: "This agreement covers all deliverables outlined. The timeline depends on client approvals within 24 hours at each stage.",
          },
          {
            id: nanoid(),
            title: "Revisions",
            content: "• Brand identity: 2 rounds of revisions\n• Content pieces: 2 rounds per piece\n• Additional revisions at hourly rate",
          },
        ],
        totalAmount: "Rs. 115,000",
      };
    case "next-steps":
      return {
        ...baseSection,
        nextStepItems: [
          { id: nanoid(), step: "Step 1", description: "Sign agreement and process the initial payment" },
          { id: nanoid(), step: "Step 2", description: "Complete onboarding form within 24 hours" },
          { id: nanoid(), step: "Step 3", description: "Brand positioning review (Days 3-4)" },
          { id: nanoid(), step: "Step 4", description: "Product photography coordination (Days 5-7)" },
          { id: nanoid(), step: "Step 5", description: "Brand identity approval meeting (Days 8-10)" },
        ],
        items: [
          "Timely approvals within 24 hours to maintain timeline",
          "Product samples for photography",
          "Account credentials or collaboration to create account",
          "Prompt responses during research phase",
        ],
      };
    case "contact":
      return {
        ...baseSection,
        contactName: "Your Name",
        contactTitle: "Business Development Executive",
        contactPhone: "+1 234 567 8900",
        contactEmail: "hello@yourcompany.com",
        closingMessage: "LOOKING FORWARD TO WORKING TOGETHER",
      };
    default:
      return baseSection;
  }
}

export function createDefaultDesignSettings(): DesignSettings {
  return {
    primaryColor: "#0d4f4f",
    secondaryColor: "#1a1a2e",
    accentColor: "#3498db",
    logoUrl: undefined,
    companyName: "Your Company",
    headerStyle: "gradient",
    fontFamily: "poppins",
  };
}

export function getSectionIcon(type: ProposalSection["type"]): string {
  switch (type) {
    case "cover": return "FileText";
    case "project-summary": return "FileText";
    case "deliverables": return "CheckSquare";
    case "approach": return "Lightbulb";
    case "timeline": return "Calendar";
    case "why-choose-us": return "Star";
    case "pricing": return "DollarSign";
    case "next-steps": return "ArrowRight";
    case "terms": return "FileCheck";
    case "contact": return "Mail";
    default: return "FileText";
  }
}

export function getSectionDisplayName(type: ProposalSection["type"]): string {
  switch (type) {
    case "cover": return "Cover Page";
    case "project-summary": return "Project Summary";
    case "deliverables": return "Deliverables";
    case "approach": return "Approach";
    case "timeline": return "Timeline";
    case "why-choose-us": return "Why Choose Us";
    case "pricing": return "Pricing & Terms";
    case "next-steps": return "Next Steps";
    case "terms": return "Terms & Conditions";
    case "contact": return "Contact";
    default: return "Section";
  }
}
