import { useState } from "react";
import { 
  GripVertical, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  FileText,
  CheckSquare,
  Lightbulb,
  Calendar,
  Star,
  DollarSign,
  ArrowRight,
  Mail,
  Plus,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LimitedTextarea } from "@/components/ui/limited-textarea";
import { LimitedInput } from "@/components/ui/limited-input";
import { cn, nanoid } from "@/lib/utils";
import type { ProposalSection } from "@shared/schema";
import { getSectionDisplayName } from "@/lib/proposal-utils";

interface SectionEditorProps {
  section: ProposalSection;
  index: number;
  onChange: (section: ProposalSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const sectionIcons: Record<string, React.ElementType> = {
  "cover": FileText,
  "project-summary": FileText,
  "deliverables": CheckSquare,
  "approach": Lightbulb,
  "timeline": Calendar,
  "why-choose-us": Star,
  "pricing": DollarSign,
  "next-steps": ArrowRight,
  "terms": DollarSign,
  "contact": Mail,
};

export function SectionEditor({
  section,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SectionEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = sectionIcons[section.type] || FileText;

  const updateSection = (updates: Partial<ProposalSection>) => {
    onChange({ ...section, ...updates });
  };

  return (
    <Card className="overflow-visible">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 p-3 border-b">
          <div className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="p-1.5 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <Input
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              className="h-8 font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
              data-testid={`input-section-title-${index}`}
            />
          </div>

          <Badge variant="secondary" className="text-xs">
            {getSectionDisplayName(section.type)}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-7 w-7"
              data-testid={`button-move-up-${index}`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-7 w-7"
              data-testid={`button-move-down-${index}`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-7 w-7 text-destructive hover:text-destructive"
              data-testid={`button-delete-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {renderSectionContent(section, updateSection, index)}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function renderSectionContent(
  section: ProposalSection,
  updateSection: (updates: Partial<ProposalSection>) => void,
  index: number
) {
  switch (section.type) {
    case "cover":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Tagline</label>
            <Input
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              placeholder="LET'S GROW TOGETHER."
              data-testid={`input-cover-tagline-${index}`}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Subtitle</label>
            <Input
              value={section.subtitle || ""}
              onChange={(e) => updateSection({ subtitle: e.target.value })}
              placeholder="Optional subtitle"
              data-testid={`input-cover-subtitle-${index}`}
            />
          </div>
        </div>
      );

    case "project-summary":
    case "approach":
      return (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-900 font-medium mb-1">✍️ Keep it Short:</p>
            <p className="text-xs text-amber-700">
              Write <strong>one short paragraph</strong> (3-5 sentences). This ensures consistent spacing and professional look.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              💡 Aim for 400-600 characters for best fit on half page.
            </p>
          </div>
          <LimitedTextarea
            label="Content"
            value={section.content || ""}
            onChange={(e) => updateSection({ content: e.target.value })}
            placeholder="Write one concise paragraph (3-5 sentences) summarizing the key points..."
            className="min-h-[100px]"
            maxLength={800}
            data-testid={`input-content-${index}`}
          />
        </div>
      );

    case "deliverables":
      return (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-green-900 font-medium mb-1">📦 Deliverables Guide:</p>
            <p className="text-xs text-green-700">
              Add <strong>3-4 phases maximum</strong> for best fit. Each phase should have 3-5 items.
            </p>
          </div>
          <DeliverableEditor
            items={section.deliverableItems || []}
            onChange={(items) => updateSection({ deliverableItems: items })}
            sectionIndex={index}
          />
        </div>
      );

    case "timeline":
      return (
        <div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-purple-900 font-medium mb-1">⏱️ Timeline Guide:</p>
            <p className="text-xs text-purple-700">
              Add <strong>3-5 timeline items</strong> depending on project length. Each item gets equal spacing.
            </p>
          </div>
          <TimelineEditor
            items={section.timelineItems || []}
            onChange={(items) => updateSection({ timelineItems: items })}
            sectionIndex={index}
          />
        </div>
      );

    case "why-choose-us":
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
            <label className="text-sm font-medium mb-3 block text-primary">🎨 Circular Logo Configuration</label>

            {/* Circular Logo Configuration - Always Enabled */}
            <div className="space-y-3 p-3 bg-white rounded-lg border">
              <div>
                <label className="text-xs font-medium mb-1 block">Company Name (Center)</label>
                <Input
                  value={section.companyName || ""}
                  onChange={(e) => updateSection({ companyName: e.target.value, useCircularLogo: true })}
                  placeholder="KAYI"
                  className="text-sm"
                  data-testid={`input-company-name-${index}`}
                />
                <p className="text-xs text-muted-foreground mt-1">Highlighted in center of circular logo</p>
              </div>
              <div className="border-t pt-3 mt-2">
                <p className="text-xs text-muted-foreground">
                  ✨ The circular logo will automatically use your proposal's colors
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📝 Content is pre-written with professional marketing points
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📄 This section will take a full page in your proposal
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pricing Format</label>
            <div className="space-y-3">
              <PricingTableEditor
                rows={section.pricingTableRows || []}
                paymentTerms={section.paymentTerms || ""}
                onChange={(rows, terms) => updateSection({ pricingTableRows: rows, paymentTerms: terms })}
                sectionIndex={index}
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Legacy Format (Terms)</label>
            <TermsEditor
              items={section.termItems || []}
              totalAmount={section.totalAmount || ""}
              onChange={(items, total) => updateSection({ termItems: items, totalAmount: total })}
              sectionIndex={index}
            />
          </div>
        </div>
      );

    case "next-steps":
      return (
        <div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-indigo-900 font-medium mb-1">🗺️ Card Grid Layout Guide:</p>
            <p className="text-xs text-indigo-700">
              Add <strong>3-5 steps</strong> for onboarding process. Steps appear as professional cards in a grid.
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              📝 Keep step names to <strong>max 3 words</strong> for perfect alignment (e.g., "Discovery Call", "Sign Contract")
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              💡 Last step will be highlighted with primary color for emphasis
            </p>
          </div>
          <NextStepsEditor
            steps={section.nextStepItems || []}
            requirements={section.items || []}
            onChange={(steps, reqs) => updateSection({ nextStepItems: steps, items: reqs })}
            sectionIndex={index}
          />
        </div>
      );

    case "contact":
      return (
        <ContactEditor
          section={section}
          onChange={updateSection}
          sectionIndex={index}
        />
      );

    default:
      return (
        <div>
          <LimitedTextarea
            label="Content"
            value={section.content || ""}
            onChange={(e) => updateSection({ content: e.target.value })}
            placeholder="Enter content..."
            className="min-h-[120px]"
            maxLength={1000}
          />
        </div>
      );
  }
}

function DeliverableEditor({ 
  items, 
  onChange,
  sectionIndex
}: { 
  items: NonNullable<ProposalSection["deliverableItems"]>;
  onChange: (items: NonNullable<ProposalSection["deliverableItems"]>) => void;
  sectionIndex: number;
}) {
  const addPhase = () => {
    onChange([...items, { id: nanoid(), title: "New Phase", items: ["New deliverable"] }]);
  };

  const updatePhase = (phaseIndex: number, updates: Partial<typeof items[0]>) => {
    const newItems = [...items];
    newItems[phaseIndex] = { ...newItems[phaseIndex], ...updates };
    onChange(newItems);
  };

  const removePhase = (phaseIndex: number) => {
    onChange(items.filter((_, i) => i !== phaseIndex));
  };

  const addDeliverable = (phaseIndex: number) => {
    const newItems = [...items];
    newItems[phaseIndex].items = [...newItems[phaseIndex].items, "New deliverable"];
    onChange(newItems);
  };

  const updateDeliverable = (phaseIndex: number, itemIndex: number, value: string) => {
    const newItems = [...items];
    newItems[phaseIndex].items[itemIndex] = value;
    onChange(newItems);
  };

  const removeDeliverable = (phaseIndex: number, itemIndex: number) => {
    const newItems = [...items];
    newItems[phaseIndex].items = newItems[phaseIndex].items.filter((_, i) => i !== itemIndex);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((phase, phaseIndex) => (
        <div key={phase.id} className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={phase.title}
              onChange={(e) => updatePhase(phaseIndex, { title: e.target.value })}
              className="font-medium"
              placeholder="Phase title"
              data-testid={`input-phase-title-${sectionIndex}-${phaseIndex}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePhase(phaseIndex)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 pl-4">
            {phase.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary flex-shrink-0" />
                <Input
                  value={item}
                  onChange={(e) => updateDeliverable(phaseIndex, itemIndex, e.target.value)}
                  className="flex-1"
                  data-testid={`input-deliverable-${sectionIndex}-${phaseIndex}-${itemIndex}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeliverable(phaseIndex, itemIndex)}
                  className="h-7 w-7"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addDeliverable(phaseIndex)}
              className="text-muted-foreground"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add item
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addPhase} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Phase
      </Button>
    </div>
  );
}

function TimelineEditor({
  items,
  onChange,
  sectionIndex
}: {
  items: NonNullable<ProposalSection["timelineItems"]>;
  onChange: (items: NonNullable<ProposalSection["timelineItems"]>) => void;
  sectionIndex: number;
}) {
  const addItem = () => {
    onChange([...items, { id: nanoid(), period: "Week X", title: "New Phase", description: "" }]);
  };

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={item.period}
              onChange={(e) => updateItem(index, { period: e.target.value })}
              placeholder="Period (e.g., Week 1-2)"
              className="w-32"
              data-testid={`input-timeline-period-${sectionIndex}-${index}`}
            />
            <Input
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
              placeholder="Phase title"
              className="flex-1"
              data-testid={`input-timeline-title-${sectionIndex}-${index}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <LimitedTextarea
            value={item.description}
            onChange={(e) => updateItem(index, { description: e.target.value })}
            placeholder="Description"
            className="min-h-[60px]"
            maxLength={300}
            data-testid={`input-timeline-desc-${sectionIndex}-${index}`}
          />
        </div>
      ))}
      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Timeline Phase
      </Button>
    </div>
  );
}

function FeatureEditor({
  items,
  onChange,
  sectionIndex,
  maxItems
}: {
  items: NonNullable<ProposalSection["featureItems"]>;
  onChange: (items: NonNullable<ProposalSection["featureItems"]>) => void;
  sectionIndex: number;
  maxItems?: number;
}) {
  const addItem = () => {
    const num = String(items.length + 1).padStart(2, "0");
    onChange([...items, { id: nanoid(), number: num, title: "NEW FEATURE", description: "Feature description" }]);
  };

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const canAddMore = maxItems === undefined || items.length < maxItems;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={item.number}
                onChange={(e) => updateItem(index, { number: e.target.value })}
                className="w-16 text-center font-bold"
                data-testid={`input-feature-number-${sectionIndex}-${index}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="text-destructive ml-auto h-7 w-7"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
              placeholder="Feature title"
              className="font-medium text-sm"
              data-testid={`input-feature-title-${sectionIndex}-${index}`}
            />
            <LimitedTextarea
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="Description"
              className="min-h-[60px] text-sm"
              maxLength={250}
              data-testid={`input-feature-desc-${sectionIndex}-${index}`}
            />
          </div>
        ))}
      </div>
      {canAddMore && (
        <Button variant="outline" onClick={addItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Feature {maxItems && `(${items.length}/${maxItems})`}
        </Button>
      )}
      {maxItems && items.length >= maxItems && (
        <p className="text-xs text-center text-muted-foreground">
          Maximum {maxItems} segments reached for circular logo
        </p>
      )}
    </div>
  );
}

function TermsEditor({
  items,
  totalAmount,
  onChange,
  sectionIndex
}: {
  items: NonNullable<ProposalSection["termItems"]>;
  totalAmount: string;
  onChange: (items: NonNullable<ProposalSection["termItems"]>, total: string) => void;
  sectionIndex: number;
}) {
  const addItem = () => {
    onChange([...items, { id: nanoid(), title: "New Term", content: "" }], totalAmount);
  };

  const updateItem = (index: number, updates: Partial<typeof items[0]>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems, totalAmount);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index), totalAmount);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder="Term title"
                className="font-medium"
                data-testid={`input-term-title-${sectionIndex}-${index}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <LimitedTextarea
              value={item.content}
              onChange={(e) => updateItem(index, { content: e.target.value })}
              placeholder="Term content"
              className="min-h-[80px]"
              maxLength={500}
              data-testid={`input-term-content-${sectionIndex}-${index}`}
            />
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <label className="text-sm text-muted-foreground mb-1 block">Total Amount</label>
        <Input
          value={totalAmount}
          onChange={(e) => onChange(items, e.target.value)}
          placeholder="Rs. 115,000"
          className="font-bold"
          data-testid={`input-total-amount-${sectionIndex}`}
        />
      </div>

      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Term
      </Button>
    </div>
  );
}

function NextStepsEditor({
  steps,
  requirements,
  onChange,
  sectionIndex
}: {
  steps: NonNullable<ProposalSection["nextStepItems"]>;
  requirements: string[];
  onChange: (steps: NonNullable<ProposalSection["nextStepItems"]>, reqs: string[]) => void;
  sectionIndex: number;
}) {
  const addStep = () => {
    const defaultSteps = [
      { step: "Discovery Call", description: "Initial consultation to understand your needs" },
      { step: "Proposal Review", description: "Review and approve the proposal" },
      { step: "Contract Signing", description: "Sign agreement and make initial payment" },
      { step: "Project Kickoff", description: "Meet the team and finalize timeline" },
      { step: "Launch", description: "Project completion and delivery" }
    ];
    const example = defaultSteps[steps.length % 5];
    onChange([...steps, { id: nanoid(), ...example }], requirements);
  };

  const updateStep = (index: number, updates: Partial<typeof steps[0]>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onChange(newSteps, requirements);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index), requirements);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Onboarding Timeline Steps (Max 5)</label>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={step.step}
                      onChange={(e) => {
                        const words = e.target.value.trim().split(/\s+/);
                        if (words.length <= 3 || e.target.value === '') {
                          updateStep(index, { step: e.target.value });
                        }
                      }}
                      placeholder="Step name (e.g., Discovery Call)"
                      className="w-full"
                      data-testid={`input-step-title-${sectionIndex}-${index}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 3 words ({step.step.trim().split(/\s+/).filter(w => w).length}/3)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    className="text-destructive h-9 w-9"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Input
                value={step.description}
                onChange={(e) => updateStep(index, { description: e.target.value })}
                placeholder="Brief description of what happens in this step"
                data-testid={`input-step-desc-${sectionIndex}-${index}`}
              />
              {index === steps.length - 1 && (
                <p className="text-xs text-green-600 font-medium">
                  ✨ This will be the emphasized final step (larger circle)
                </p>
              )}
            </div>
          ))}
          {steps.length < 5 && (
            <Button variant="outline" onClick={addStep} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Timeline Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingTableEditor({
  rows,
  paymentTerms,
  onChange,
  sectionIndex
}: {
  rows: NonNullable<ProposalSection["pricingTableRows"]>;
  paymentTerms: string;
  onChange: (rows: NonNullable<ProposalSection["pricingTableRows"]>, terms: string) => void;
  sectionIndex: number;
}) {
  const addRow = () => {
    const defaultRows = [
      { service: "Website Development", description: "Write what is included (e.g., 3-page responsive website)", investment: "Included" },
      { service: "Design Services", description: "Write deliverables (e.g., 3 concepts + 3 revision rounds)", investment: "Included" },
      { service: "Total Investment", description: "Complete package summary", investment: "Rs 90,000" }
    ];
    const example = defaultRows[rows.length % 3];
    onChange([...rows, { id: nanoid(), ...example }], paymentTerms);
  };

  const updateRow = (index: number, updates: Partial<typeof rows[0]>) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...updates };
    onChange(newRows, paymentTerms);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index), paymentTerms);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-blue-900 font-medium mb-1">📋 Table Guide:</p>
        <p className="text-xs text-blue-700">
          <strong>Column 1:</strong> Service name • <strong>Column 2:</strong> What's included/delivered • <strong>Column 3:</strong> Price or "Included"
        </p>
        <p className="text-xs text-blue-700 mt-1">💡 Last row should be "Total Investment" with final price</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Pricing Table Rows</label>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="border rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <Input
                  value={row.service}
                  onChange={(e) => updateRow(index, { service: e.target.value })}
                  placeholder="Service name (e.g., Website Development)"
                  className="flex-1"
                  data-testid={`input-service-${sectionIndex}-${index}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(index)}
                  className="text-destructive h-9 w-9"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                placeholder="What you'll deliver (e.g., 3-page responsive website with SEO)"
                data-testid={`input-description-${sectionIndex}-${index}`}
              />
              <Input
                value={row.investment}
                onChange={(e) => updateRow(index, { investment: e.target.value })}
                placeholder='Write price or "Included" (e.g., Rs 50,000 or Included)'
                data-testid={`input-investment-${sectionIndex}-${index}`}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addRow} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Service Row
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Payment Terms</label>
        <Textarea
          value={paymentTerms || '70% upfront and remaining 30% on project completion'}
          onChange={(e) => onChange(rows, e.target.value)}
          placeholder="70% upfront and remaining 30% on project completion"
          className="min-h-[60px]"
          data-testid={`input-payment-terms-${sectionIndex}`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Default: "70% upfront and remaining 30% on project completion"
        </p>
      </div>
    </div>
  );
}

function ContactEditor({
  section,
  onChange,
  sectionIndex
}: {
  section: ProposalSection;
  onChange: (updates: Partial<ProposalSection>) => void;
  sectionIndex: number;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Name</label>
          <Input
            value={section.contactName || ""}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="Your Name"
            data-testid={`input-contact-name-${sectionIndex}`}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Title</label>
          <Input
            value={section.contactTitle || ""}
            onChange={(e) => onChange({ contactTitle: e.target.value })}
            placeholder="Job Title"
            data-testid={`input-contact-title-${sectionIndex}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
          <Input
            value={section.contactPhone || ""}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder="+1 234 567 8900"
            data-testid={`input-contact-phone-${sectionIndex}`}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <Input
            value={section.contactEmail || ""}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder="email@company.com"
            data-testid={`input-contact-email-${sectionIndex}`}
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Closing Message</label>
        <Input
          value={section.closingMessage || ""}
          onChange={(e) => onChange({ closingMessage: e.target.value })}
          placeholder="LOOKING FORWARD TO WORKING TOGETHER"
          data-testid={`input-closing-message-${sectionIndex}`}
        />
      </div>
    </div>
  );
}
