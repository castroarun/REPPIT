# Strength Profile App - Development Plan

**Version:** 2.0
**Date:** 2025-12-02
**Status:** Planning

---

## Table of Contents

1. [Scope Expansion Summary](#1-scope-expansion-summary)
2. [New GitHub Repository](#2-new-github-repository)
3. [Jira Integration Workflow](#3-jira-integration-workflow)
4. [Expanded Exercise System](#4-expanded-exercise-system)
5. [Motivational Quotes Feature](#5-motivational-quotes-feature)
6. [Development Tracking in Jira](#6-development-tracking-in-jira)
7. [Next Steps](#7-next-steps)

---

## 1. Scope Expansion Summary

### New Features Added

| Feature | Description |
|---------|-------------|
| **Motivational Quotes** | Display workout quote/benefit at app bottom on each login |
| **Jira Integration** | Development workflow tied to Jira tasks and statuses |
| **Expanded Exercises** | Body part filtering, 20+ exercises |
| **GitHub Repo** | Existing repo: `buildfolio` |
| **GitHub Project** | New project: `strength_profile_app` |

### Original Features (Retained)

- Multiple profiles (up to 5)
- Strength standards calculation
- Level tracking (Beginner → Advanced)
- Local storage (Phase 1)

---

## 2. New GitHub Repository

### Repository Details

```
Name: strength_profile_app
URL: https://github.com/castroarun/buildfolio/strength_profile_app (to create)
```

### Repo Structure

```
strength_profile_app/
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── prd-review.md
│       ├── design-review.md
│       └── bug-report.md
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   ├── lib/
│   │   ├── jira/              # Jira API client
│   │   ├── quotes/            # Quotes API client
│   │   ├── calculations/      # Strength formulas
│   │   └── storage/
│   ├── hooks/
│   └── types/
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   ├── TEST-PLAN.csv
│   ├── DEV-CLOCK.md
│   └── WALKTHROUGH.md
├── .claude/
│   └── instructions.md
└── .jira/
    └── config.json            # Jira project config (gitignored)
```

---

## 3. Jira Integration Workflow

### Jira Configuration

```
Domain: [Your Atlassian domain]
Project Key: SPT (Strength Profile Tracker)
Board Type: Kanban or Scrum
```

### Required Jira Statuses

| Status | Description | Trigger |
|--------|-------------|---------|
| **To Do** | Task created, not started | Auto on task creation |
| **In Review** | Document ready for review | PRD/Design complete |
| **In Review (Redo)** | Changes requested | User adds comments |
| **In Development** | Approved, coding started | User moves after review |
| **Testing** | Build complete, testing | After build phase |
| **Done** | Task complete | After shipping |

### Development Workflow with Jira

```
┌─────────────────────────────────────────────────────────────────────┐
│                        JIRA-INTEGRATED WORKFLOW                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: PRD Created                                                │
│     └─→ Jira Task: "SPT-1: PRD Review"                              │
│         Status: "In Review"                                          │
│         Attachment: PRD.md                                           │
│                                                                      │
│  Step 2: User Reviews                                                │
│     ├─→ Approved: Move to "In Development"                          │
│     └─→ Changes: Add comment, status "In Review - Hold"             │
│                                                                      │
│  Step 3: AI Remediates                                               │
│     └─→ Comment: Remediation notes + revised doc attached           │
│         Status: Back to "In Review"                                  │
│                                                                      │
│  Step 4: Approved → Build                                            │
│     └─→ Status: "In Development"                                     │
│         Sub-tasks created for each feature                          │
│                                                                      │
│  Step 5: Build Complete                                              │
│     └─→ Status: "Testing"                                            │
│                                                                      │
│  Step 6: Testing Passed                                              │
│     └─→ Status: "Done"                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Jira Task Types

| Type | Usage |
|------|-------|
| **Epic** | Major feature (e.g., "Exercise System") |
| **Story** | User-facing feature |
| **Task** | Development task (PRD, Design, Build) |
| **Sub-task** | Specific implementation items |

### Jira API Integration

```typescript
// Required Jira API endpoints
POST /rest/api/3/issue           // Create task
PUT  /rest/api/3/issue/{key}     // Update status
POST /rest/api/3/issue/{key}/comment  // Add comment
POST /rest/api/3/issue/{key}/attachments  // Attach documents
GET  /rest/api/3/issue/{key}/transitions  // Get available transitions
POST /rest/api/3/issue/{key}/transitions  // Move status
```

### Comment Logging Format

**User Review Comment:**
```
[USER REVIEW] 2025-12-02

Status: Changes Requested

Comments:
- Need to add more exercises for back
- Calculation for rows seems low
- Add progress visualization

Requested By: @castroarun
```

**AI Remediation Comment:**
```
[AI REMEDIATION] 2025-12-02

Changes Made:
1. Added 4 back exercises (lat pulldown, rows, pull-ups, face pulls)
2. Updated row multipliers based on strengthlevel.com data
3. Added progress bar visualization in mockup

Revised Document: PRD-v2.md (attached)
Ready for re-review.
```

---

## 4. Expanded Exercise System

### Body Part Categories

| Body Part | Exercises |
|-----------|-----------|
| **Chest** | Bench Press, Incline Bench, Dumbbell Press, Cable Fly |
| **Back** | Deadlift, Barbell Row, Lat Pulldown, Pull-ups, Cable Row |
| **Shoulders** | Shoulder Press (Machine), Shoulder Press (Dumbbell), Side Lateral (Cable), Side Lateral (Dumbbell), Front Raise, Rear Delt Fly |
| **Legs** | Squat, Leg Press, Romanian Deadlift, Leg Curl, Leg Extension, Calf Raise |
| **Arms** | Bicep Curl (Barbell), Bicep Curl (Dumbbell), Tricep Pushdown, Skull Crushers |
| **Core** | Weighted Plank, Cable Crunch, Hanging Leg Raise |

### Strength Standards by Exercise

Based on [Strength Level](https://strengthlevel.com/) and [Legion Athletics](https://legionathletics.com/strength-standards/):

#### Chest Exercises

| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Bench Press | 0.59 | 0.82 | 1.06 | 1.29 |
| Incline Bench | 0.50 | 0.70 | 0.90 | 1.10 |
| Dumbbell Press | 0.25 | 0.35 | 0.45 | 0.55 |
| Cable Fly | 0.15 | 0.22 | 0.30 | 0.40 |

#### Back Exercises

| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Deadlift | 0.94 | 1.29 | 1.71 | 2.18 |
| Barbell Row | 0.50 | 0.70 | 0.90 | 1.15 |
| Lat Pulldown | 0.50 | 0.70 | 0.90 | 1.10 |
| Pull-ups | 0.5x | 0.8x | 1.0x | 1.3x |
| Cable Row | 0.50 | 0.70 | 0.90 | 1.10 |

#### Shoulder Exercises

| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Shoulder Press (Barbell) | 0.41 | 0.59 | 0.76 | 1.00 |
| Shoulder Press (Machine) | 0.35 | 0.50 | 0.65 | 0.85 |
| Shoulder Press (Dumbbell) | 0.18 | 0.26 | 0.35 | 0.45 |
| Side Lateral (Dumbbell) | 0.08 | 0.12 | 0.16 | 0.22 |
| Side Lateral (Cable) | 0.06 | 0.10 | 0.14 | 0.20 |
| Front Raise | 0.10 | 0.15 | 0.20 | 0.28 |

#### Leg Exercises

| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Squat | 0.76 | 1.12 | 1.47 | 1.88 |
| Leg Press | 1.50 | 2.20 | 3.00 | 3.80 |
| Romanian Deadlift | 0.60 | 0.85 | 1.10 | 1.40 |
| Leg Curl | 0.30 | 0.45 | 0.60 | 0.80 |
| Leg Extension | 0.40 | 0.55 | 0.75 | 0.95 |

#### Arm Exercises

| Exercise | BEG | NOV | INT | ADV |
|----------|-----|-----|-----|-----|
| Bicep Curl (Barbell) | 0.25 | 0.38 | 0.50 | 0.65 |
| Bicep Curl (Dumbbell) | 0.12 | 0.18 | 0.25 | 0.32 |
| Tricep Pushdown | 0.25 | 0.38 | 0.50 | 0.65 |

> **Note:** Dumbbell exercises show per-hand multiplier. Pull-ups use bodyweight multiplier (added weight).

### Filter/Selection UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Filter by Body Part:                                           │
│                                                                  │
│  [All] [Chest] [Back] [Shoulders] [Legs] [Arms] [Core]         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your Exercises (Rated):                    ← Shows first       │
│  ┌─────────────────────────────────────┐                        │
│  │ Bench Press      NOV  70kg          │                        │
│  │ Squat            INT  95kg          │                        │
│  │ Deadlift         INT  145kg         │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
│  Not Yet Rated:                             ← Shows after       │
│  ┌─────────────────────────────────────┐                        │
│  │ Shoulder Press   [ Rate ]           │                        │
│  │ Barbell Row      [ Rate ]           │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Motivational Quotes Feature

### Feature Description

Display a motivational workout quote or scientific fitness benefit at the bottom of the app on each login/app open.

### Quote Sources

| Source | Type | API |
|--------|------|-----|
| [ZenQuotes](https://zenquotes.io/) | General motivation | Free, rate limited |
| [API Ninjas](https://api-ninjas.com/api/quotes) | Category filtered | Free tier |
| Custom JSON | Fitness-specific | Local file |

### Implementation Approach

**Recommended: Hybrid Approach**

1. **Local JSON file** with 100+ curated fitness quotes/facts
2. **Fallback to API** when online for variety
3. **Cache last 10 quotes** for offline use

### Quote Data Structure

```typescript
interface Quote {
  id: string
  text: string
  author?: string
  category: 'motivation' | 'science' | 'benefit'
  source?: string
}

// Example quotes
const FITNESS_QUOTES: Quote[] = [
  {
    id: '1',
    text: 'Strength training increases bone density by up to 3% per year.',
    category: 'science',
    source: 'Journal of Bone and Mineral Research'
  },
  {
    id: '2',
    text: 'The only bad workout is the one that didn\'t happen.',
    author: 'Unknown',
    category: 'motivation'
  },
  {
    id: '3',
    text: 'Regular resistance training can improve sleep quality by 42%.',
    category: 'benefit',
    source: 'Sleep Medicine Reviews'
  }
]
```

### UI Placement

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Content                              │
│                            ...                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💪 "Strength training increases bone density by up to 3%       │
│      per year."                                                  │
│                        — Journal of Bone and Mineral Research   │
│                                                                  │
│                         [Refresh Quote]                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Development Tracking in Jira

### Jira Project Structure

```
Project: Strength Profile Tracker (SPT)

Epics:
├── SPT-EPIC-1: Core Profile System
├── SPT-EPIC-2: Exercise & Standards Engine
├── SPT-EPIC-3: Jira Integration
└── SPT-EPIC-4: Quotes Feature

Tasks (Example):
├── SPT-1: PRD v2.0 Review
├── SPT-2: Design Document Review
├── SPT-3: Test Plan Review
├── SPT-4: Build - Profile Management
├── SPT-5: Build - Exercise Filter System
├── SPT-6: Build - Quotes Integration
└── SPT-7: Build - Jira API Client
```

### Progress Logging

Each development step creates/updates Jira:

| Step | Jira Action |
|------|-------------|
| PRD Created | Create task "PRD Review", attach doc, status "In Review" |
| PRD Approved | Transition to "In Development" |
| PRD Changes | Add comment with changes, status "In Review - Hold" |
| Design Created | Create task "Design Review", attach doc |
| Build Started | Create sub-tasks for each feature |
| Build Complete | Update task, add completion comment |
| Testing | Create test task, log results as comments |
| Ship | Close all tasks, add deployment notes |

### Automation via Claude

When you provide feedback:
- **Here in chat**: I'll format and log as Jira comment
- **In Jira directly**: I'll read and respond via API

Example interaction:
```
You: "Need to add calf raise exercise to legs"

Claude Action:
1. Add Jira comment: "[USER FEEDBACK] Add calf raise exercise to legs category"
2. Update PRD with calf raise
3. Add Jira comment: "[AI REMEDIATION] Added calf raise (0.8-1.5 BW multipliers)"
4. Attach updated PRD
```

---

## 7. Next Steps

### Immediate Actions

1. **Create GitHub Repo**
   ```bash
   # Create repo: strength_profile_app
   # Initialize with README
   ```

2. **Set Up Jira Project**
   - Create project "SPT"
   - Configure statuses
   - Create initial epic

3. **Provide Jira Credentials**
   - Jira domain
   - Email
   - API token
   - Project key

4. **Update PRD**
   - Add expanded exercises
   - Add quotes feature
   - Add Jira workflow

### Your Decisions Needed

| Question | Options |
|----------|---------|
| Jira Cloud or Server? | Cloud (Atlassian) / Server |
| Create Jira project now? | Yes / Later |
| Quote source preference? | Local JSON / API / Both |
| Exercise list complete? | Yes / Add more |

---

## Sources

- [Strength Level](https://strengthlevel.com/) - Strength standards data
- [Legion Athletics](https://legionathletics.com/strength-standards/) - Body weight multipliers
- [ZenQuotes API](https://zenquotes.io/) - Motivational quotes
- [API Ninjas](https://api-ninjas.com/api/quotes) - Category-filtered quotes

---

**Document Status:** Awaiting Review
**Next:** Your feedback on this plan
