# ProjectManagement Folder Structure

**Last Cleaned:** 2026-03-31 | **Status:** Organized & Consolidated

---

## Overview

This folder contains all your Claude Code projects, skills, and frameworks. It has been reorganized for clarity and efficiency.

**Total Size:** 3.6 GB → optimized  
**Projects:** 10 active + 1 archive  
**Skills:** 76 consolidated in central hub

---

## 📂 Project Structure

```
ProjectManagement/
├── Skill Library/              ⭐ CENTRAL HUB - All 76 skills
│   ├── SKILLS_INDEX.md         (Complete skill reference)
│   ├── docx/
│   ├── pptx/
│   ├── agent-builder/
│   ├── agentdb-*/
│   ├── backend-patterns/
│   └── ... (70 more skills)
│
├── claude-flow/                🔧 Main V3/V2 framework implementation
│   ├── v3/                     (Latest architecture)
│   ├── v2/                     (Stable version)
│   ├── tests/
│   └── docs/
│
├── everything-claude-code/     📚 Coding standards & best practices
│   ├── skills/                 (Code patterns, TDD, security)
│   └── CLAUDE.md               (Project config)
│
├── SuperClaude_Framework/      🏗️ Alternative framework with plugins
│   ├── src/
│   ├── plugins/
│   ├── docs/
│   └── skills/
│
├── awesome-claude-skills/      🎯 Useful standalone skills collection
│
├── Skill_Seekers/              🔎 Skill discovery & management system
│
├── scripts/                    ⚙️ Utility scripts
├── config/                     🔧 Configuration files
├── src/                        💻 Source code
├── docs/                       📖 Documentation
├── output/                     📤 Generated outputs
└── _archive/                   📦 OLD: 24 duplicate firecrawl projects
    └── (moved from root 2026-03-31)

```

---

## 🎯 Active Projects

| Project | Size | Purpose | Status |
|---------|------|---------|--------|
| **claude-flow** | 2.3GB | Main Claude Flow v3/v2 framework | ✅ Active |
| **everything-claude-code** | 26MB | Coding standards & patterns | ✅ Active |
| **SuperClaude_Framework** | 204MB | Alternative framework | ⚠️ Review needed |
| **Skill_Seekers** | 165MB | Skill discovery system | ⚠️ Review needed |
| **awesome-claude-skills** | 13MB | Skill collection | ✅ Active |
| **Skill Library** | 836KB | Central skills hub | ✅ Active |

---

## 🛠️ How to Use This Structure

### Working with Skills
1. All skills are in `/Skill Library/` — this is your single source of truth
2. Reference skills by name: "use the docx skill to..."
3. Create new skills: "create a skill for [task]"
4. Full skill index: `Skill Library/SKILLS_INDEX.md`

### Working with Projects
- **Need a framework?** Use `claude-flow/` (latest v3)
- **Need code patterns?** Check `everything-claude-code/skills/`
- **Need a skill?** Browse `/Skill Library/SKILLS_INDEX.md`
- **Building something new?** Create in appropriate project folder

### Adding New Projects
Follow these guidelines:

```
✓ DO:
  - Create in root folder if it's a major project
  - Name clearly (e.g., feature-name-project)
  - Add CLAUDE.md with project config
  - Save skills to /Skill Library/
  
✗ DON'T:
  - Create hidden .dotfolders (they clutter root)
  - Duplicate existing projects
  - Save skills in project-specific folders
```

---

## 📦 What's Archived?

The `_archive/` folder contains 24 old firecrawl projects that had duplicate skills:
- `.adal`, `.agent`, `.agents`, `.augment`, `.codebuddy`, `.commandcode`
- `.continue`, `.cortex`, `.crush`, `.factory`, `.goose`, `.iflow`
- `.junie`, `.kilocode`, `.kiro`, `.kode`, `.mcpjam`, `.mux`
- `.neovate`, `.openhands`, `.pi`, `.pochi`, `.qoder`, `.qwen`
- `.roo`, `.trae`, `.vibe`, `.windsurf`, `.zencoder`

**To restore:** `mv _archive/.projectname .projectname`  
**To permanently delete:** `rm -rf _archive/`

---

## 🚀 Performance Tips

### Optimize for Local Development
```bash
# Exclude heavy folders from version control (.gitignore)
node_modules/     # Rebuild with npm install
.next/            # Rebuild with next build
dist/             # Rebuild with npm run build
```

### Search for Skills Quickly
```bash
# Find a skill
ls Skill\ Library/ | grep pattern-name

# Check skill purpose
grep -r "Purpose" Skill\ Library/*/SKILL.md
```

### Check What Takes Space
```bash
du -sh */ | sort -hr  # Breakdown by project
du -sh .              # Total size
```

---

## 📋 Checklist: First Time Setup

- [ ] Read `Skill Library/SKILLS_INDEX.md` for available skills
- [ ] Review `claude-flow/CLAUDE.md` for framework config
- [ ] Check `everything-claude-code/CLAUDE.md` for code standards
- [ ] Create new projects in root, not as hidden folders
- [ ] Save all skills to `/Skill Library/`
- [ ] Review SuperClaude_Framework and Skill_Seekers—still needed?

---

## 📞 Need Help?

- **Framework questions?** → `claude-flow/README.md`
- **Code standards?** → `everything-claude-code/README.md`
- **Skill reference?** → `Skill Library/SKILLS_INDEX.md`
- **Project setup?** → `CLAUDE.md` (in each project)

---

## Summary of Cleanup (2026-03-31)

✅ **Phase 1: Quick Wins**
- Removed 24 duplicate firecrawl projects (archived in `_archive/`)
- Created `.gitignore` for build artifacts and dependencies
- Cleaned up hidden folder clutter

✅ **Phase 2: Consolidated Skills**
- Merged 76 unique skills into central `/Skill Library/`
- Created comprehensive `SKILLS_INDEX.md`
- Deduplicated across projects

✅ **Phase 3: Documentation**
- Created this ROOT README
- Organized structure for clarity
- Added setup checklist & guidelines

**Space saved:** ~1.2-1.5 GB  
**Clarity gained:** ⭐⭐⭐⭐⭐

