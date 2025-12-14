import { useState, useCallback } from "react";
import {
  FileText,
  Download,
  Plus,
  Loader2,
  Sparkles,
  Edit,
  Palette,
  FileCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  X,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LimitedInput } from "@/components/ui/limited-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/UploadZone";
import { DesignControls } from "@/components/DesignControls";
import { SectionEditor } from "@/components/SectionEditor";
import { ProposalPreview } from "@/components/ProposalPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createDefaultProposal, createSection } from "@/lib/proposal-utils";
import { apiRequest } from "@/lib/queryClient";
import type { Proposal, ProposalSection, DesignSettings, SectionType } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sectionTypes: { type: SectionType; label: string }[] = [
  { type: "project-summary", label: "Project Summary" },
  { type: "deliverables", label: "Deliverables" },
  { type: "approach", label: "Approach" },
  { type: "timeline", label: "Timeline" },
  { type: "why-choose-us", label: "Why Choose Us" },
  { type: "pricing", label: "Pricing & Terms" },
  { type: "next-steps", label: "Next Steps" },
  { type: "contact", label: "Contact" },
];

export default function Home() {
  const { toast } = useToast();
  const [proposal, setProposal] = useState<Proposal>(createDefaultProposal());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const handleAnalyze = async (text: string, strategicQuestions: any) => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/analyze", { text, strategicQuestions });
      const result = await response.json();
      
      if (result.success && result.data) {
        const analysis = result.data;
        
        setProposal(prev => ({
          ...prev,
          title: analysis.projectName || prev.title,
          clientName: analysis.clientName || prev.clientName,
          sections: prev.sections.map(section => {
            if (section.type === "project-summary" && analysis.summary) {
              return { ...section, content: analysis.summary };
            }
            if (section.type === "approach" && analysis.suggestedApproach) {
              return { ...section, content: analysis.suggestedApproach };
            }
            if (section.type === "deliverables" && analysis.deliverables?.length > 0) {
              return {
                ...section,
                deliverableItems: analysis.deliverables.map((d: any, i: number) => ({
                  id: `del-${i}`,
                  title: d.title,
                  items: d.items,
                })),
              };
            }
            if (section.type === "timeline" && analysis.timeline?.length > 0) {
              return {
                ...section,
                timelineItems: analysis.timeline.map((t: any, i: number) => ({
                  id: `time-${i}`,
                  period: t.period,
                  title: t.title,
                  description: t.description,
                })),
              };
            }
            if (section.type === "pricing") {
              const updatedSection: any = { ...section };

              // Update termItems if available
              if (analysis.suggestedTerms?.length > 0) {
                updatedSection.termItems = analysis.suggestedTerms.map((t: any, i: number) => ({
                  id: `term-${i}`,
                  title: t.title,
                  content: t.content,
                }));
              }

              // Update pricingTableRows if available
              if (analysis.pricingTableRows?.length > 0) {
                updatedSection.pricingTableRows = analysis.pricingTableRows.map((row: any, i: number) => ({
                  id: `price-row-${i}`,
                  service: row.service,
                  description: row.description,
                  investment: row.investment,
                }));
                updatedSection.paymentTerms = "70% payment should be upfront and 30% on completion of project";
              }

              // Update totalAmount
              if (analysis.totalAmount) {
                updatedSection.totalAmount = analysis.totalAmount;
              }

              return updatedSection;
            }
            if (section.type === "next-steps" && analysis.nextStepItems?.length > 0) {
              return {
                ...section,
                nextStepItems: analysis.nextStepItems.map((step: any, i: number) => ({
                  id: `step-${i}`,
                  step: step.step,
                  description: step.description,
                })),
              };
            }
            return section;
          }),
          updatedAt: new Date().toISOString(),
        }));

        toast({
          title: "Analysis Complete",
          description: "Your proposal has been updated with AI-generated content.",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze requirements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposal.title.replace(/\s+/g, "_")}_Proposal.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Generated",
        description: "Your professional proposal has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const updateSection = useCallback((index: number, section: ProposalSection) => {
    setProposal(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? section : s),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteSection = useCallback((index: number) => {
    setProposal(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setProposal(prev => {
      const newSections = [...prev.sections];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newSections.length) return prev;
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      return { ...prev, sections: newSections, updatedAt: new Date().toISOString() };
    });
  }, []);

  const addSection = useCallback((type: SectionType) => {
    const newSection = createSection(type, sectionTypes.find(s => s.type === type)?.label || "New Section", "");
    setProposal(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateDesignSettings = useCallback((settings: DesignSettings) => {
    setProposal(prev => ({
      ...prev,
      designSettings: settings,
      updatedAt: new Date().toISOString(),
    }));
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Proposal Perfect</h1>
                <p className="text-sm text-muted-foreground">Create stunning proposals with AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                size="lg"
                className="gap-2 shadow-md"
                data-testid="button-download-pdf"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Step Navigation */}
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-4 w-full max-w-3xl h-auto p-2">
              <TabsTrigger value="upload" className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-5 w-5" />
                <div className="text-xs font-medium">Upload & Analyze</div>
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Edit className="h-5 w-5" />
                <div className="text-xs font-medium">Edit Content</div>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Palette className="h-5 w-5" />
                <div className="text-xs font-medium">Design & Style</div>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileCheck className="h-5 w-5" />
                <div className="text-xs font-medium">Preview & Download</div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Upload & Analyze */}
          <TabsContent value="upload" className="space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">Start Your Proposal</h2>
                <p className="text-muted-foreground text-lg">
                  Upload your requirements document or paste text, and let AI analyze it to create your proposal structure
                </p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Proposal Details</CardTitle>
                  <CardDescription>Set the basic information for your proposal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LimitedInput
                    label="Proposal Title"
                    value={proposal.title}
                    onChange={(e) => setProposal(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg"
                    placeholder="e.g., Website Redesign Proposal"
                    maxLength={100}
                    data-testid="input-proposal-title"
                  />
                  <LimitedInput
                    label="Client Name"
                    value={proposal.clientName}
                    onChange={(e) => setProposal(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="e.g., Acme Corporation"
                    maxLength={50}
                    data-testid="input-client-name"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("edit")} size="lg" className="gap-2">
                  Continue to Edit Content
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Edit Content */}
          <TabsContent value="edit" className="space-y-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">Edit Your Content</h2>
                <p className="text-muted-foreground text-lg">
                  Customize each section of your proposal to perfectly match your needs
                </p>
              </div>

              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-6 py-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">Manage Sections</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="gap-2" data-testid="button-add-section">
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {sectionTypes.map((item) => (
                      <DropdownMenuItem
                        key={item.type}
                        onClick={() => addSection(item.type)}
                        data-testid={`menu-add-${item.type}`}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-6 pr-4">
                  {proposal.sections.map((section, index) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      index={index}
                      onChange={(s) => updateSection(index, s)}
                      onDelete={() => deleteSection(index)}
                      onMoveUp={() => moveSection(index, "up")}
                      onMoveDown={() => moveSection(index, "down")}
                      isFirst={index === 0}
                      isLast={index === proposal.sections.length - 1}
                    />
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button onClick={() => setActiveTab("upload")} variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Back to Upload
                </Button>
                <Button onClick={() => setActiveTab("design")} size="lg" className="gap-2">
                  Continue to Design
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Design & Style */}
          <TabsContent value="design" className="space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">Customize Your Design</h2>
                <p className="text-muted-foreground text-lg">
                  Choose colors, fonts, and branding to make your proposal uniquely yours
                </p>
              </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Design Settings</CardTitle>
                  <CardDescription>Customize the visual appearance of your proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  <DesignControls
                    settings={proposal.designSettings}
                    onChange={updateDesignSettings}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button onClick={() => setActiveTab("edit")} variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Back to Edit
                </Button>
                <Button onClick={() => setActiveTab("preview")} size="lg" className="gap-2">
                  Continue to Preview
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Preview & Download */}
          <TabsContent value="preview" className="space-y-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold">Preview Your Proposal</h2>
                <p className="text-muted-foreground text-lg">
                  Review your proposal and download when you're ready
                </p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex justify-center">
                    <div className="w-full max-w-4xl">
                      <ProposalPreview proposal={proposal} scale={0.65} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button onClick={() => setActiveTab("design")} variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Back to Design
                </Button>
                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("edit")} variant="outline" size="lg">
                    Edit Content
                  </Button>
                  <Button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    size="lg"
                    className="gap-2 shadow-md"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
