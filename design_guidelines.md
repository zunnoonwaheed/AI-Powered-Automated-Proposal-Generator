# Proposal Perfect - Design Guidelines

## Design Approach

**Reference-Based Hybrid Strategy:**
- **Application Interface**: Inspired by Linear's clean workspace + Notion's content editing flexibility
- **Proposal Output**: Based on the Kayi Digital proposal aesthetic - modern, premium, professional with gradient accents and sophisticated typography

**Design Principles:**
1. Premium sophistication for proposal outputs
2. Intuitive, distraction-free editing experience
3. Clear visual hierarchy and professional polish
4. Seamless editor-to-PDF transition

---

## Typography System

**Application Interface:**
- Primary: Inter (400, 500, 600, 700)
- Headings: 24px bold, 18px semibold, 14px medium
- Body: 14px regular, 12px for secondary text
- Code/Technical: JetBrains Mono for file names, technical details

**Proposal Templates:**
- Display: Outfit or Clash Display (700-800) for major headings
- Headings: Poppins (600-700) for section titles
- Body: Inter (400-500) for readable content
- Sizes: 48px hero titles, 32px section headers, 18px body, 14px captions

---

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 3, 4, 6, 8, 12, 16, 20, 24

**Application Layout:**
- Three-panel workspace: Upload sidebar (300px) | Editor canvas (flexible) | Preview panel (400px toggle)
- Editor canvas: max-w-4xl centered, py-12 px-8
- Section cards: p-6 with mb-6 spacing

**Proposal Layout:**
- A4 proportions (210mm × 297mm equivalent)
- Margins: 60px all sides for content safety
- Section spacing: 80px between major sections
- Content max-width: 85% of page width for readability

---

## Component Library

### Application Components

**Upload Zone:**
- Dashed border card (h-48) with centered icon and text
- Drag-active state with subtle background shift
- File type indicator badges

**Editor Toolbar:**
- Sticky top bar with section controls
- Icon buttons (p-2) with tooltips
- Grouped actions with dividers (mx-3)

**Section Editor Cards:**
- Rounded corners (rounded-lg)
- Subtle border with hover elevation
- Drag handle on left, controls on right
- Inline editing for all text fields

**Design Controls Panel:**
- Collapsible sidebar sections
- Logo upload preview (w-32 h-32)
- Color picker with preset swatches
- Typography selector with live preview

**Preview Panel:**
- Fixed aspect ratio A4 preview
- Zoom controls (50%, 75%, 100%)
- Export button (prominent, gradient background)

### Proposal Template Components

**Cover Page:**
- Full-height hero with large company logo (top-right)
- Centered title (48px bold) with gradient text treatment
- Subtitle and client name (24px light)
- Decorative geometric shapes or gradient overlays

**Section Headers:**
- Bold uppercase title (32px) with gradient underline accent
- Optional icon/number on left (40px circle)
- Spacious padding (py-16)

**Content Blocks:**
- Timeline: Vertical timeline with connected dots
- Deliverables: Numbered list with checkmark icons
- Pricing: Clean table with alternating row backgrounds
- Why Choose Us: Icon grid (2×2 or 4-column) with bold titles

**Footer/Contact:**
- Split layout: Contact info left, company branding right
- Social icons with consistent spacing (gap-4)
- Subtle top border separator

---

## Visual Elements

**Gradient Treatments:**
- Primary gradients for accents (not backgrounds)
- Subtle gradient overlays on cover page
- Gradient text for emphasis titles

**Iconography:**
- Heroicons for application UI (20px, 24px)
- Custom or premium icons for proposal sections (32px-48px)
- Consistent line weight and style

**Borders & Dividers:**
- Hairline borders (1px) for subtle separation
- Thicker accent lines (3px) for section breaks
- Rounded corners consistently at 8px or 12px

---

## Images

**Application Interface:**
- No hero image needed
- Illustrative graphics for empty states (upload zone, no proposals)
- Small preview thumbnails in proposal history list

**Proposal Templates:**
- Logo placement: Top-right corner (120px max-width) or centered on cover
- Optional: Background textures/patterns (subtle, low opacity)
- Product/service images: Integrated into relevant sections with proper padding
- Team photos: Circular avatars if included in "Why Choose Us" sections

---

## Color Strategy

(Colors will be customizable per proposal, but application interface should use neutral professional palette with accent highlights)

---

## Interaction Notes

- Auto-save indicator (subtle top-right notification)
- Section reordering via drag handles
- Inline editing with click-to-edit fields
- Real-time preview updates (debounced)
- Smooth transitions between editing and preview states
- Export loading state with progress indicator