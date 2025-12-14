import { useState, useCallback } from "react";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { StrategicQuestions } from "@shared/schema";

interface UploadZoneProps {
  onAnalyze: (text: string, questions: StrategicQuestions) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onAnalyze, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<StrategicQuestions>({
    projectGoal: "",
    keyDeliverables: "",
    budget: "",
    timeline: "",
    targetAudience: "",
    successCriteria: "",
    constraints: "",
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    
    if (file.type === "text/plain") {
      const content = await file.text();
      setText(content);
    } else if (file.type === "application/pdf") {
      setText(`[PDF File: ${file.name}]\n\nPDF content will be extracted and analyzed.`);
    }
  };

  const handleAnalyze = () => {
    if (text.trim()) {
      onAnalyze(text, questions);
    }
  };

  const updateQuestion = (key: keyof StrategicQuestions, value: string) => {
    setQuestions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI-Powered Analysis</h3>
            <p className="text-sm text-muted-foreground">Upload requirements or paste text to generate a proposal</p>
          </div>
        </div>

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" data-testid="tab-paste">
              <FileText className="h-4 w-4 mr-2" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4">
            <Textarea
              placeholder="Paste your project requirements, client brief, or any text you want to turn into a professional proposal..."
              className="min-h-[200px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="input-requirements-text"
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileInput}
                data-testid="input-file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, TXT, DOC, DOCX
                  </p>
                </div>
              </label>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-muted rounded-lg inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Strategic Questions (Help AI understand better)
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            These questions help AI generate more accurate and tailored proposal content
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="projectGoal" className="text-xs font-medium">
                1. What is the main project goal/objective?
              </Label>
              <Input
                id="projectGoal"
                placeholder="e.g., Increase online sales by 50%, modernize legacy system"
                value={questions.projectGoal}
                onChange={(e) => updateQuestion("projectGoal", e.target.value)}
                data-testid="input-project-goal"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keyDeliverables" className="text-xs font-medium">
                2. What are the key deliverables you expect?
              </Label>
              <Input
                id="keyDeliverables"
                placeholder="e.g., Mobile app, web dashboard, API integration, documentation"
                value={questions.keyDeliverables}
                onChange={(e) => updateQuestion("keyDeliverables", e.target.value)}
                data-testid="input-key-deliverables"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-xs font-medium">
                3. What is your budget range?
              </Label>
              <Input
                id="budget"
                placeholder="e.g., $15,000 - $25,000, or flexible based on scope"
                value={questions.budget}
                onChange={(e) => updateQuestion("budget", e.target.value)}
                data-testid="input-budget"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeline" className="text-xs font-medium">
                4. What is your desired timeline/deadline?
              </Label>
              <Input
                id="timeline"
                placeholder="e.g., 8-10 weeks, must launch by Q2 2024"
                value={questions.timeline}
                onChange={(e) => updateQuestion("timeline", e.target.value)}
                data-testid="input-timeline"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetAudience" className="text-xs font-medium">
                5. Who is the target audience/end user?
              </Label>
              <Input
                id="targetAudience"
                placeholder="e.g., B2B clients, young professionals, enterprise customers"
                value={questions.targetAudience}
                onChange={(e) => updateQuestion("targetAudience", e.target.value)}
                data-testid="input-target-audience"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="successCriteria" className="text-xs font-medium">
                6. How will you measure success?
              </Label>
              <Input
                id="successCriteria"
                placeholder="e.g., User adoption rate, performance metrics, ROI targets"
                value={questions.successCriteria}
                onChange={(e) => updateQuestion("successCriteria", e.target.value)}
                data-testid="input-success-criteria"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="constraints" className="text-xs font-medium">
                7. Any specific constraints or requirements?
              </Label>
              <Input
                id="constraints"
                placeholder="e.g., Must integrate with Salesforce, GDPR compliance, mobile-first"
                value={questions.constraints}
                onChange={(e) => updateQuestion("constraints", e.target.value)}
                data-testid="input-constraints"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="w-full"
          size="lg"
          data-testid="button-analyze"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Proposal with AI
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
