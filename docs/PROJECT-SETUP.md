# Strength Profile Tracker - Project Setup

**Version:** 1.0
**Date:** 2025-12-02
**Status:** Pre-Development Planning

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [9-Step Development Process](#9-step-development-process)
4. [Mockup Review & UI/UX Feedback](#mockup-review--uiux-feedback)
5. [Local Storage Analysis](#local-storage-analysis)
6. [File Structure](#file-structure)
7. [Next Steps](#next-steps)

---

## Project Overview

A mobile-first strength profile tracking application that calculates personalized strength standards based on user attributes (age, height, weight) and allows users to track their progress across key compound lifts.

**Core Features (from Mockup):**
- Multiple user profiles (up to 5 slots)
- Profile creation with name, age, height, weight
- Personalized strength standards calculation
- 4 exercise categories: Bench Press, Squat, Deadlift, Shoulder Press
- 4 progression levels: Beginner (BEG), Novice (NOV), Intermediate (INT), Advanced (ADV)
- Progress tracking and level updates
- Standards based on body weight ratios

---

## Tech Stack

### Recommended Stack (Aligned with NoteApp)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | Modern React, SSR, API routes |
| **Language** | TypeScript (strict mode) | Type safety, better DX |
| **Styling** | Tailwind CSS v3 | Rapid UI development, consistent design |
| **Database** | Supabase (PostgreSQL) | See [Local Storage Analysis](#local-storage-analysis) |
| **Auth** | Supabase Auth (Google OAuth) | Simple, secure, pre-built |
| **State** | React Context + hooks | Sufficient for app complexity |
| **Forms** | React Hook Form + Zod | Validation, type-safe forms |

### Alternative: Local Storage MVP

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ | Same as above |
| **Language** | TypeScript | Same as above |
| **Styling** | Tailwind CSS v3 | Same as above |
| **Storage** | localStorage + IndexedDB | Offline-first, no backend needed |
| **State** | React Context | Sync with localStorage |

### Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager (faster than npm) |
| ESLint + Prettier | Code quality |
| Vitest | Unit testing |
| Git | Version control |

---

## 9-Step Development Process

Based on the NoteApp workflow, here's the adapted process for Strength Profile Tracker:

### Phase Overview

```
Step 1: DEV-CLOCK Setup        → Time tracking from day 1
Step 2: PRD & Design Document  → Design decisions for approval
Step 3: Test Cases             → Validate understanding before code
Step 4: Build                  → AI writes, human reviews
Step 5: Manual Testing         → Human verifies functionality
Step 6: Debug & Feedback       → Iterative fixes
Step 7: Code Walkthrough       → Documentation for code familiarity
Step 8: Ship                   → Deploy to production
Step 9: Time Retrospective     → Analyze where time went
```

### Step Details

#### Step 1: DEV-CLOCK Setup
Create `docs/DEV-CLOCK.md` with tracking template:

| Phase | Estimated Hours | Actual Hours |
|-------|-----------------|--------------|
| Design & Planning | 2-3 | - |
| Documentation | 1-2 | - |
| Building | 8-12 | - |
| Debugging | 3-5 | - |
| Testing | 2-3 | - |
| Shipping | 1-2 | - |
| **Total** | **17-27** | - |

#### Step 2: PRD & Design Document
- Create `docs/DESIGN.md` with:
  - Objective
  - Capabilities list
  - Strength calculation formula
  - Database schema
  - UI component breakdown
  - File structure

#### Step 3: Test Cases
- Create `docs/TEST-PLAN.csv`:
  - Profile CRUD operations
  - Strength calculation accuracy
  - Level progression logic
  - UI interactions
  - Edge cases (min/max values)

#### Step 4: Build
- Follow approved design
- Reusable components
- Clear function comments

#### Step 5: Manual Testing
- Test on mobile viewport
- Cross-browser testing
- Edge case verification

#### Step 6: Debug & Feedback
- Log issues found
- Fix and verify

#### Step 7: Code Walkthrough
- Create `docs/WALKTHROUGH.md`
- Document key code paths

#### Step 8: Ship
- Deploy to Vercel
- Environment setup
- Domain configuration

#### Step 9: Time Retrospective
- Update DEV-CLOCK with actuals
- Analyze time distribution
- Document lessons learned

---

## Mockup Review & UI/UX Feedback

### Current Design Analysis

**Screens Reviewed:**
1. Strength Profiles (List View)
2. New Profile (Form)
3. John Doe Profile (Detail View)
4. Update Levels (Edit View)

### What Works Well

| Element | Observation |
|---------|-------------|
| Color Coding | Clear level distinction (Green/Blue/Yellow/Red) |
| Information Hierarchy | Profile info → Standards → Progress legend |
| Profile Cards | Clean avatar + details layout |
| Empty Slots | Good visual placeholder for available slots |
| Mobile-First | Appears designed for mobile viewport |

### Improvement Recommendations

#### 1. Typography Issues

**Current Problems:**
- Fonts appear generic/system default
- Weight numbers in boxes are small and cramped
- Level labels (BEG, NOV, INT, ADV) lack visual weight
- Header text could be bolder

**Recommendations:**
```
Primary Font: Inter or SF Pro Display (clean, modern)
Weight Numbers: 16-18px, semi-bold
Level Labels: 12px, medium weight, uppercase
Headers: 18-20px, bold
Body: 14-16px, regular
```

**Tailwind Implementation:**
```css
/* tailwind.config.ts */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}

/* Usage */
.weight-number { @apply text-lg font-semibold }
.level-label { @apply text-xs font-medium uppercase tracking-wide }
.section-header { @apply text-xl font-bold }
```

#### 2. Weight Boxes Redesign

**Current:** Small boxes with cramped numbers and tiny "kg" labels

**Recommended:**
- Larger touch targets (min 44x44px)
- Weight number as primary focus
- Unit label subtle but readable
- Selected state more prominent
- Add subtle shadow or border to unselected

```
┌─────────┐
│   50    │  ← Larger, bolder number
│   kg    │  ← Subtle unit
│  BEG    │  ← Clear level indicator
└─────────┘
```

#### 3. Progress Visualization

**Add:** A visual progress bar or chart showing:
- Current level per exercise
- Overall strength score
- Progress trend over time

**Consider:**
```
Bench Press  ████░░░░ Novice (70kg)
Squat        ██████░░ Intermediate (95kg)
```

#### 4. Color Refinements

**Current Colors (Estimated):**
- BEG: #10B981 (Green)
- NOV: #3B82F6 (Blue)
- INT: #F59E0B (Yellow/Amber)
- ADV: #EF4444 (Red)

**Suggested Adjustments:**
- ADV could be #EC4899 (Pink/Magenta) to avoid "danger" connotation
- Or use a gradient progression: Green → Blue → Purple → Gold

#### 5. Header Bar

**Current:** Solid blue (#2C5282 or similar)

**Options:**
- Keep solid color but add subtle gradient
- Make it slightly darker for better contrast
- Consider a dark mode version early

#### 6. Additional UI Suggestions

| Area | Suggestion |
|------|------------|
| **Profile List** | Add swipe-to-delete on mobile |
| **Form Inputs** | Larger input fields, better placeholders |
| **Buttons** | More prominent Save button, subtle Cancel |
| **Feedback** | Add success/error toast notifications |
| **Loading** | Skeleton loaders for data fetch |
| **Empty State** | Motivational message when no profiles exist |

---

## Local Storage Analysis

### The Question

> Is localStorage the right choice for this app?

### Analysis

| Factor | Local Storage | Supabase/Cloud |
|--------|---------------|----------------|
| **Offline Access** | Full offline support | Requires connection |
| **Multi-Device** | No sync | Seamless sync |
| **Data Persistence** | Can be cleared | Permanent |
| **Implementation** | Simpler | More setup |
| **Cost** | Free | Free tier available |
| **User Accounts** | Not needed | Required |
| **Backup** | Manual export | Automatic |
| **Storage Limit** | ~5-10MB | Essentially unlimited |

### Recommendation

**For MVP/POC:** Start with localStorage
- Faster to build
- No authentication complexity
- Sufficient for single-device use
- Can validate the concept

**For Production:** Migrate to Supabase
- Users expect data persistence
- Multi-device access (phone + tablet + desktop)
- Proper user accounts
- Data backup and recovery
- Already proven in NoteApp

### Hybrid Approach (Best of Both)

```
1. Primary Storage: Supabase (PostgreSQL)
2. Offline Cache: localStorage + IndexedDB
3. Sync Strategy: Optimistic updates, background sync
4. Guest Mode: localStorage only until signup
```

**Implementation Pattern:**
```typescript
// Hybrid storage hook
function useStrengthData() {
  // Check if user is authenticated
  const { user } = useAuth()

  if (user) {
    // Sync with Supabase
    return useSupabaseStorage()
  } else {
    // Guest mode - local only
    return useLocalStorage()
  }
}
```

### Schema (For Either Approach)

```typescript
interface Profile {
  id: string
  name: string
  age: number
  height: number  // cm
  weight: number  // kg
  createdAt: Date
  updatedAt: Date
}

interface ExerciseLevel {
  id: string
  profileId: string
  exercise: 'bench_press' | 'squat' | 'deadlift' | 'shoulder_press'
  currentLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced'
  currentWeight: number  // kg
  updatedAt: Date
}

interface StrengthStandard {
  exercise: string
  bodyweightRatio: {
    beginner: number
    novice: number
    intermediate: number
    advanced: number
  }
}
```

---

## File Structure

### Proposed Structure (Following NoteApp Pattern)

```
strength_profile_tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing/Profile list
│   │   ├── layout.tsx         # Root layout
│   │   ├── profile/
│   │   │   ├── new/page.tsx   # New profile form
│   │   │   └── [id]/page.tsx  # Profile detail
│   │   └── api/               # API routes (if using Supabase)
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI (Button, Input, Card)
│   │   ├── profile/          # Profile components
│   │   └── strength/         # Strength tracking components
│   │
│   ├── lib/                   # Business logic
│   │   ├── storage/          # localStorage or Supabase client
│   │   ├── calculations/     # Strength standard formulas
│   │   └── utils/            # Helper functions
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── styles/               # Global styles
│
├── docs/                      # Documentation
│   ├── Strength_Profile_Tracker_PRD.docx  # Original PRD
│   ├── PROJECT-SETUP.md      # This file
│   ├── DESIGN.md             # Design document (to create)
│   ├── TEST-PLAN.csv         # Test cases (to create)
│   ├── DEV-CLOCK.md          # Time tracking (to create)
│   └── WALKTHROUGH.md        # Code walkthrough (post-build)
│
├── images/                    # Prototypes and assets
│   └── strength_app_final-2.png
│
├── .claude/                   # Claude Code instructions
│   ├── instructions.md       # Project-specific instructions
│   └── coding-standards.md   # Coding standards (copy from noteApp)
│
├── public/                    # Static assets
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local                # Environment variables
```

---

## Next Steps

### Immediate Actions (Before Development)

1. **Review this document** - Approve or modify recommendations
2. **Decision on storage** - Local storage MVP or Supabase from start?
3. **Finalize font choice** - Inter, SF Pro, or system fonts?
4. **Color palette decision** - Confirm or adjust level colors
5. **Convert PRD** - Extract content from .docx to markdown DESIGN.md

### Document Creation Order

```
Step 1: docs/DEV-CLOCK.md        ← Start time tracking
Step 2: docs/DESIGN.md           ← Design document
Step 3: docs/TEST-PLAN.csv       ← Test cases
Step 4: .claude/instructions.md  ← Project instructions
Step 5: .claude/coding-standards.md ← Coding standards
```

### Waiting For

- [ ] Your approval of this setup
- [ ] Decision on Local Storage vs Supabase
- [ ] Font preference
- [ ] Any modifications to mockup feedback
- [ ] PRD content extraction from .docx

---

## Reference: NoteApp Artifacts

For consistency, the following documents from NoteApp can be adapted:

| Document | Location | Purpose |
|----------|----------|---------|
| coding-standards.md | noteApp/.claude/ | Coding patterns |
| instructions.md | noteApp/.claude/ | Project instructions |
| DEV-CLOCK.md | noteApp/docs/ | Time tracking template |
| DESIGN.md | noteApp/docs/ | Design document template |

---

**Document Status:** Awaiting Review
**Prepared by:** AI Assistant
**Review Date:** [Pending]
