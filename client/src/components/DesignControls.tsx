import { useState } from "react";
import { Palette, Type, Layout, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { DesignSettings } from "@shared/schema";

interface DesignControlsProps {
  settings: DesignSettings;
  onChange: (settings: DesignSettings) => void;
}

const colorPresets = [
  { name: "Kayi Teal", primary: "#0d4f4f", secondary: "#1a1a2e", accent: "#3498db" },
  { name: "Corporate Blue", primary: "#1e40af", secondary: "#0f172a", accent: "#0ea5e9" },
  { name: "Elegant Purple", primary: "#6b21a8", secondary: "#1e1b4b", accent: "#a855f7" },
  { name: "Professional Green", primary: "#166534", secondary: "#14532d", accent: "#22c55e" },
  { name: "Modern Orange", primary: "#c2410c", secondary: "#431407", accent: "#f97316" },
  { name: "Sleek Black", primary: "#18181b", secondary: "#09090b", accent: "#71717a" },
];

export function DesignControls({ settings, onChange }: DesignControlsProps) {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.logoUrl);

  const handleColorPreset = (preset: typeof colorPresets[0]) => {
    onChange({
      ...settings,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoPreview(dataUrl);
        onChange({ ...settings, logoUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(undefined);
    onChange({ ...settings, logoUrl: undefined });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold">Design Controls</h3>
      </div>

      <Accordion type="multiple" defaultValue={["colors", "branding", "typography"]} className="space-y-2">
        <AccordionItem value="colors" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="text-sm font-medium">Color Scheme</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorPreset(preset)}
                    className="p-2 rounded-lg border hover:border-primary transition-colors text-left"
                    data-testid={`button-preset-${preset.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex gap-1 mb-1">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-9 h-9 rounded-md border cursor-pointer"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <Input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => onChange({ ...settings, primaryColor: e.target.value })}
                      className="font-mono text-sm"
                      data-testid="input-primary-color"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-9 h-9 rounded-md border cursor-pointer"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                    <Input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => onChange({ ...settings, secondaryColor: e.target.value })}
                      className="font-mono text-sm"
                      data-testid="input-secondary-color"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-9 h-9 rounded-md border cursor-pointer"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                    <Input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
                      className="font-mono text-sm"
                      data-testid="input-accent-color"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="branding" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Branding</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Company Name</Label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => onChange({ ...settings, companyName: e.target.value })}
                  placeholder="Your Company"
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Logo</Label>
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-w-[120px] max-h-[60px] object-contain rounded-md border p-2 bg-white"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeLogo}
                      data-testid="button-remove-logo"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      data-testid="input-logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload logo</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="text-sm font-medium">Typography</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: "inter" | "poppins" | "outfit") => 
                    onChange({ ...settings, fontFamily: value })
                  }
                >
                  <SelectTrigger data-testid="select-font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poppins">Poppins</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="outfit">Outfit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Header Style</Label>
                <Select
                  value={settings.headerStyle}
                  onValueChange={(value: "gradient" | "solid" | "minimal") => 
                    onChange({ ...settings, headerStyle: value })
                  }
                >
                  <SelectTrigger data-testid="select-header-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout" className="border rounded-lg px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="text-sm font-medium">Layout</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-xs text-muted-foreground">
              Drag and drop sections in the editor to reorder them. Each section can be customized individually.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
