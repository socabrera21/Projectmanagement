# Claude Skill Library
*Last updated: 2026-04-20 | 86 skills consolidated*

This is the **single source of truth** for all Claude Code skills. All skills are mirrored here from various projects and are ready to use.

---

## Quick Start

Invoke any skill by describing your task naturally — Claude will recognize which skill applies. Examples:
- "create a new skill for [task]" → skill-creator skill
- "generate a presentation" → ppt-generation or frontend-slides
- "analyze this meeting" → meeting-insights-analyzer
- "research a prospect" → prospect-research-compiler

---

## Skills by Category

### 📄 Document & File Management
| Skill | Purpose |
|-------|---------|
| **docx** | Create, read, edit Word documents (.docx). Reports, memos, letters, templates. |
| **pptx** | Handle PowerPoint files. Create decks, extract content, edit presentations. |
| **pdf** | Process PDFs. Extract text/tables, merge, split, fill forms. |
| **xlsx** | Create & manage Excel spreadsheets. Formulas, formatting, data analysis. |

### 🎨 Presentation & Content Creation
| Skill | Purpose |
|-------|---------|
| **ppt-generation** | Generate visually rich slides by creating images for each slide. |
| **frontend-slides** | Create stunning, animation-rich HTML presentations. |
| **sales-enablement** | Create sales collateral, pitch decks, one-pagers, objection handling docs. |
| **internal-comms** | Write internal communications: status reports, newsletters, incident reports. |

### 🤖 AI Agent & System Development
| Skill | Purpose |
|-------|---------|
| **agent-builder** | Design and build AI agents for any domain. |
| **mcp-builder** | Create high-quality MCP servers for external service integration. |
| **skill-builder** | Create new skills, modify, and optimize existing ones. |
| **skill-creator** | Comprehensive skill creation with performance measurement. |

### 🔍 Research & Intelligence
| Skill | Purpose |
|-------|---------|
| **web-research** | Structured web research with comprehensive coverage. |
| **perplexity-search** | AI-powered web searches with real-time information. |
| **prospect-research-compiler** | Aggregate prospect intelligence from multiple sources. |
| **image-enhancer** | Improve image quality (resolution, sharpness, clarity). |

### 📊 Sales & Business
| Skill | Purpose |
|-------|---------|
| **saas-ae-job-search-linkedin** | Search for SaaS AE jobs and network with hiring managers on LinkedIn. |
| **linkedin-recruiter-engagement** | Craft strategic comments on LinkedIn posts from recruiters and hiring managers. |
| **sales:account-research** | Research companies and people for sales intel. |
| **sales:call-prep** | Prepare for sales calls with context and agenda. |
| **sales:daily-briefing** | Prioritized daily sales briefing. |
| **sales:draft-outreach** | Research prospects and draft personalized outreach. |
| **sales:pipeline-review** | Analyze pipeline health and risks. |
| **sales:forecast** | Generate weighted sales forecasts with scenarios. |
| **sales:call-summary** | Process call notes and extract action items. |
| **sales:competitive-intelligence** | Research competitors and build battercards. |
| **sales:create-an-asset** | Generate tailored sales assets. |

### 🏢 Interview & Career
| Skill | Purpose |
|-------|---------|
| **interview-prep** | Comprehensive job interview preparation. |
| **interview-confidence-builder** | Build unshakable interview confidence and advance through rounds. |
| **tailored-resume-generator** | Analyze job descriptions and generate tailored resumes. |
| **ats-resume-optimizer** | Optimize resumes for Applicant Tracking Systems. |
| **voice-script-rewriter** | Rewrite scripts to match your natural speaking voice. |

### 💬 Meetings & Collaboration
| Skill | Purpose |
|-------|---------|
| **meeting-notes** | Structured meeting summaries with action items. |
| **meeting-insights-analyzer** | Analyze transcripts for behavioral patterns and communication insights. |

### 🔧 Development Best Practices
| Skill | Purpose |
|-------|---------|
| **backend-patterns** | Backend architecture and design patterns. |
| **frontend-patterns** | Frontend architecture and design patterns. |
| **coding-standards** | Code quality standards and best practices. |
| **security-review** | Code security auditing and improvements. |
| **tdd-workflow** | Test-driven development workflow guidance. |
| **verification-loop** | Quality verification and testing strategies. |

### 💾 Database & Data
| Skill | Purpose |
|-------|---------|
| **postgres-patterns** | PostgreSQL patterns and optimization. |
| **clickhouse-io** | ClickHouse integration and optimization. |

### 🧠 Learning & Knowledge
| Skill | Purpose |
|-------|---------|
| **continuous-learning** | Build continuous learning workflows. |
| **continuous-learning-v2** | Enhanced continuous learning system. |
| **iterative-retrieval** | Iterative retrieval patterns for learning. |
| **strategic-compact** | Context compaction for long-running sessions. |
| **context-compression** | Compress context and reduce token usage. |

### 🔗 Advanced Frameworks
| Skill | Purpose |
|-------|---------|
| **sparc-methodology** | SPARC methodology for software development. |
| **flow-nexus-platform** | Flow Nexus platform architecture. |
| **flow-nexus-neural** | Flow Nexus neural capabilities. |
| **flow-nexus-swarm** | Flow Nexus swarm coordination. |

### 🌊 Swarm & Multi-Agent Systems
| Skill | Purpose |
|-------|---------|
| **swarm-advanced** | Advanced swarm orchestration techniques. |
| **swarm-orchestration** | Basic swarm coordination patterns. |

### 🧬 Claude Flow V3 Architecture
| Skill | Purpose |
|-------|---------|
| **v3-cli-modernization** | Modernize CLI for v3 framework. |
| **v3-core-implementation** | Core v3 implementation patterns. |
| **v3-ddd-architecture** | Domain-driven design for v3. |
| **v3-integration-deep** | Deep integration patterns. |
| **v3-mcp-optimization** | Optimize MCP for v3. |
| **v3-memory-unification** | Unified memory systems. |
| **v3-performance-optimization** | Performance tuning for v3. |
| **v3-security-overhaul** | Security hardening for v3. |
| **v3-swarm-coordination** | Swarm coordination in v3. |

### 🧠 AgentDB & Knowledge Systems
| Skill | Purpose |
|-------|---------|
| **agentdb-advanced** | Advanced AgentDB features. |
| **agentdb-learning** | Learning patterns with AgentDB. |
| **agentdb-memory-patterns** | Memory pattern optimization. |
| **agentdb-optimization** | Performance optimization. |
| **agentdb-vector-search** | Vector search implementation. |
| **reasoningbank-agentdb** | ReasoningBank integration. |
| **reasoningbank-intelligence** | Intelligence extraction patterns. |

### 🔄 Automation & Hooks
| Skill | Purpose |
|-------|---------|
| **hooks-automation** | Self-learning hooks and automation. |

### 💻 Development Tools & Automation
| Skill | Purpose |
|-------|---------|
| **browser-use** | Automate browser interactions. |
| **doc-coauthoring** | Co-author documentation workflows. |
| **call-prep** | Prepare for calls (legacy). |

### 📚 GitHub & Repository Management
| Skill | Purpose |
|-------|---------|
| **github-code-review** | Automated code review. |
| **github-multi-repo** | Multi-repository management. |
| **github-project-management** | GitHub project automation. |
| **github-release-management** | Release automation. |
| **github-workflow-automation** | Workflow automation. |

### 🛠️ Utilities & Helpers
| Skill | Purpose |
|-------|---------|
| **golang-patterns** | Go language patterns. |
| **golang-testing** | Go testing best practices. |
| **project-guidelines-example** | Project structure guidelines. |
| **pair-programming** | Pair programming patterns. |
| **eval-harness** | Evaluation framework. |
| **stream-chain** | Stream processing patterns. |
| **prompt-lookup** | Discover and retrieve prompts. |
| **prompt-master** | Generate optimized prompts for any AI tool. |
| **consolidate-memory** | Merge duplicates, fix stale facts, and prune memory files. |
| **setup-cowork** | Guided Cowork setup — install plugins, try skills, connect tools. |
| **skill-sync** | Audit and sync skills across Cowork, Claude Code repo, and skill-vault. |

---

## How to Create a New Skill

1. Say: **"create a new skill for [your task]"**
2. Claude will use `skill-creator` to build and save it here
3. Your skill is automatically added to this index

## How to Use a Skill

Reference skills by name in your requests:
- "use the docx skill to create a report"
- "with the agentdb-advanced skill, build a memory system"
- "apply the sparc-methodology to this project"

---

## Project Organization

This folder consolidates skills from:
- **Skill Library/** ← Central hub (you are here)
- **everything-claude-code/skills** ← Coding standards
- **.claude/skills** ← Advanced frameworks & platforms
- **SuperClaude_Framework** ← Framework-specific skills
- **Skill_Seekers** ← Skill discovery system

All are now centralized here for easy access and management.
