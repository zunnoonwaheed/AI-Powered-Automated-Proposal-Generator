import { z } from "zod";

// Proposal Section Types
export const sectionTypes = [
  "cover",
  "project-summary",
  "deliverables",
  "approach",
  "timeline",
  "why-choose-us",
  "pricing",
  "next-steps",
  "terms",
  "contact"
] as const;

export type SectionType = typeof sectionTypes[number];

// Timeline Item
export const timelineItemSchema = z.object({
  id: z.string(),
  period: z.string(),
  title: z.string(),
  description: z.string(),
  items: z.array(z.string()).optional(),
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;

// Deliverable Item
export const deliverableItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.string()),
});

export type DeliverableItem = z.infer<typeof deliverableItemSchema>;

// Pricing Item
export const pricingItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.string(),
  dueDate: z.string().optional(),
});

export type PricingItem = z.infer<typeof pricingItemSchema>;

// Why Choose Us Feature
export const featureItemSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  description: z.string(),
});

export type FeatureItem = z.infer<typeof featureItemSchema>;

// Next Step Item
export const nextStepItemSchema = z.object({
  id: z.string(),
  step: z.string(),
  description: z.string(),
});

export type NextStepItem = z.infer<typeof nextStepItemSchema>;

// Term Item
export const termItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export type TermItem = z.infer<typeof termItemSchema>;

// Pricing Table Row
export const pricingTableRowSchema = z.object({
  id: z.string(),
  service: z.string(),
  description: z.string(),
  investment: z.string(),
});

export type PricingTableRow = z.infer<typeof pricingTableRowSchema>;

// Proposal Section
export const proposalSectionSchema = z.object({
  id: z.string(),
  type: z.enum(sectionTypes),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
  timelineItems: z.array(timelineItemSchema).optional(),
  deliverableItems: z.array(deliverableItemSchema).optional(),
  pricingItems: z.array(pricingItemSchema).optional(),
  pricingTableRows: z.array(pricingTableRowSchema).optional(),
  tableHeaders: z.object({
    service: z.string(),
    description: z.string(),
    investment: z.string(),
  }).optional(),
  featureItems: z.array(featureItemSchema).optional(),
  nextStepItems: z.array(nextStepItemSchema).optional(),
  termItems: z.array(termItemSchema).optional(),
  totalAmount: z.string().optional(),
  paymentTerms: z.string().optional(),
  imageUrl: z.string().optional(),
  useCircularLogo: z.boolean().optional(),
  companyName: z.string().optional(),
  centerText: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  closingMessage: z.string().optional(),
});

export type ProposalSection = z.infer<typeof proposalSectionSchema>;

// Design Settings
export const designSettingsSchema = z.object({
  primaryColor: z.string().default("#0d4f4f"),
  secondaryColor: z.string().default("#1a1a2e"),
  accentColor: z.string().default("#3498db"),
  logoUrl: z.string().optional(), // Company logo (Kayi Digital - top LEFT)
  clientLogoUrl: z.string().optional(), // Client logo (top RIGHT)
  companyName: z.string().default("Your Company"),
  headerStyle: z.enum(["gradient", "solid", "minimal"]).default("gradient"),
  fontFamily: z.enum(["inter", "poppins", "outfit"]).default("poppins"),
});

export type DesignSettings = z.infer<typeof designSettingsSchema>;

// Full Proposal
export const proposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  clientName: z.string(),
  sections: z.array(proposalSectionSchema),
  designSettings: designSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Proposal = z.infer<typeof proposalSchema>;

// AI Analysis Result
export const aiAnalysisResultSchema = z.object({
  projectName: z.string(),
  clientName: z.string(),
  summary: z.string(),
  deliverables: z.array(z.object({
    title: z.string(),
    items: z.array(z.string()),
  })),
  timeline: z.array(z.object({
    period: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  suggestedApproach: z.string(),
  keyRequirements: z.array(z.string()),
  suggestedTerms: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).optional(),
  totalAmount: z.string().optional(),
  pricingTableRows: z.array(z.object({
    service: z.string(),
    description: z.string(),
    investment: z.string(),
  })).optional(),
  nextStepItems: z.array(z.object({
    step: z.string(),
    description: z.string(),
  })).optional(),
});

export type AIAnalysisResult = z.infer<typeof aiAnalysisResultSchema>;

// Strategic Questions for better AI analysis
export const strategicQuestionsSchema = z.object({
  projectGoal: z.string().optional(),
  keyDeliverables: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  targetAudience: z.string().optional(),
  successCriteria: z.string().optional(),
  constraints: z.string().optional(),
});

export type StrategicQuestions = z.infer<typeof strategicQuestionsSchema>;

// API Request/Response types
export const analyzeRequirementsSchema = z.object({
  text: z.string().min(1),
  strategicQuestions: strategicQuestionsSchema.optional(),
});

export type AnalyzeRequirementsRequest = z.infer<typeof analyzeRequirementsSchema>;

export const generatePdfSchema = z.object({
  proposal: proposalSchema,
});

export type GeneratePdfRequest = z.infer<typeof generatePdfSchema>;

// Keep existing user schema for compatibility
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
