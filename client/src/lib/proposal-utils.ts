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
        useCircularLogo: true,
        companyName: "KAYI DIGITAL",
        centerText: "WHY CHOOSE",
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
        statItems: [
          { id: nanoid(), value: "500+", label: "Projects Delivered" },
          { id: nanoid(), value: "98%", label: "Client Satisfaction" },
          { id: nanoid(), value: "10+", label: "Years Experience" },
          { id: nanoid(), value: "24/7", label: "Support Available" },
        ],
      };
    case "pricing":
      return {
        ...baseSection,
        title: "Investment & Pricing",
        pricingTableRows: [
          {
            id: nanoid(),
            service: "Brand Strategy & Research",
            description: "Market analysis, competitor research, brand positioning document",
            investment: "Included",
          },
          {
            id: nanoid(),
            service: "Visual Identity Design",
            description: "Logo design, color palette, typography, brand guidelines",
            investment: "Included",
          },
          {
            id: nanoid(),
            service: "Content Creation",
            description: "12 Instagram posts, 4 Reels, 4 Stories with professional editing",
            investment: "Included",
          },
          {
            id: nanoid(),
            service: "Product Photography",
            description: "Professional product shoot with 3 setups and editing",
            investment: "Included",
          },
          {
            id: nanoid(),
            service: "Strategy & Planning",
            description: "Content calendar, hashtag strategy, engagement plan",
            investment: "Included",
          },
          {
            id: nanoid(),
            service: "Total Investment",
            description: "Complete package - Month 1",
            investment: "Rs. 115,000",
          },
        ],
        paymentTerms: "70% payment should be upfront and 30% on completion of project",
        totalAmount: "Rs. 115,000",
      };
    case "next-steps":
      return {
        ...baseSection,
        nextStepItems: [
          { id: nanoid(), step: "Discovery Call", description: "Schedule your kickoff call to discuss project vision, goals, and success metrics with our team" },
          { id: nanoid(), step: "Review Proposal", description: "Review and approve the proposal, timeline, and deliverables - we'll address any questions" },
          { id: nanoid(), step: "Sign Contract", description: "Sign the agreement and process 50% initial payment to secure your project start date" },
          { id: nanoid(), step: "Start Project", description: "Begin execution with dedicated team assignment, project brief finalization, and timeline confirmation" },
          { id: nanoid(), step: "Launch Ready", description: "Final delivery, testing, training, and go-live support to ensure seamless implementation" },
        ],
        items: [
          "Quick decision-making to keep project momentum",
          "Access to necessary resources and brand materials",
          "Timely feedback and approvals within agreed timeframes",
          "Open communication channel with project team",
        ],
      };
    case "contact":
      return {
        ...baseSection,
        contactName: "Kayi Digital Team",
        contactTitle: "Business Development Executive",
        contactPhone: "+92 309 0613822",
        contactEmail: "hello@kayi.digital",
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
    backgroundColor: "#ffffff",
    logoUrl: undefined,
    companyName: "Kayi Digital",
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
