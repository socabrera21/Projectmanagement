---
name: skill-sync
description: Audit and synchronize skills across three environments — Cowork Desktop (.skills/skills/ and plugins), a Claude Code repo (with a skills/ subdirectory), and a skill-vault folder (portable .zip backups). Detects drift, copies missing skills in both directions, packages everything to the vault, and flags duplicates or stale files. Use this skill whenever the user says "sync my skills", "align my environments", "skill inventory", "check for skill drift", "are my skills aligned", "update my skill vault", "what skills am I missing", "skill audit", or any variation of wanting to ensure their Claude Code, Cowork, and skill-vault are in sync. Also trigger when they mention skills being "out of date", "misaligned", or "not matching". Always use this skill for environment alignment — don't try to do it manually.
---

# Skill Sync

Keeps three skill environments aligned: Cowork Desktop, a Claude Code repo, and a skill-vault.

## Why This Exists

When someone builds and installs skills across two active environments (Cowork Desktop and Claude Code) plus a portable backup vault, they drift over time — new skills get added to one place but not the others, files get updated in Cowork but not the repo, and the vault falls behind both. This skill runs an audit, shows what's out of sync, and fixes it.

## The Three Environments

| Environment | Path | Writable? | What's There |
|------------|------|-----------|--------------|
| **Cowork skills** | `.skills/skills/` | NO (read-only during sessions) | Installed Cowork skills |
| **Cowork plugins** | `.local-plugins/marketplaces/local-desktop-app-uploads/` | NO (read-only) | Multi-skill plugins |
| **Remote plugins** | `.remote-plugins/` | NO (read-only) | Marketplace plugins |
| **Claude Code repo** | User-selected folder with a `skills/` subdirectory | YES | All skills as folders |
| **Skill-vault** | User-selected folder with `.zip` backups | YES (can write, can't delete) | Packaged .zip backups |

Important filesystem constraints learned from experience:
- `.skills/`, `.local-plugins/`, `.remote-plugins/` are **read-only** — you can read from them but never write
- User-selected folders allow writes but **not deletes** — you can create and overwrite, but `rm` fails
- Cross-mount `cp` fails silently (creates empty files). Use `cat source > dest` instead
- Binary files (fonts, images like .ttf, .jpg) cannot be copied between mounts. Only text files transfer.

## Setup — Required Every Session

This skill needs two user-selected folders to work. Cowork skills (.skills/skills/ and plugins) are always auto-detected, but the **repo** and **vault** locations depend on which folders the user has mounted.

**Before running anything, ask the user:**

> "Which folder has your Claude Code skills? And which one is your skill-vault?"

The script will try to auto-detect them from mounted folders:
- A folder containing a `skills/` subdirectory with SKILL.md files → that's the **repo**
- A folder containing `.zip` files of packaged skills → that's the **vault**

If auto-detection works, confirm with the user before proceeding. If it fails, ask them to mount the missing folder or pass the path explicitly:

```bash
bash scripts/skill-sync.sh --all --repo /path/to/repo --vault /path/to/vault
```

If the user hasn't mounted one of the folders, tell them which one is missing and ask them to add it (using the folder picker in Cowork). The skill cannot run without both.

## Workflow

Run the sync script first, then act on the results.

### Step 1: Run the Inventory

Execute `scripts/skill-sync.sh`. It produces a structured report showing:

1. **Skills in all three places** (fully aligned)
2. **Skills in Cowork but NOT in repo** (need copying to repo)
3. **Skills in repo but NOT in Cowork** (repo-only, can't auto-install)
4. **Skills in repo but NOT in vault** (need packaging)
5. **Duplicate/stale files in vault** (old .skill/.md formats alongside .zip)

Show the user this report and ask what they want to do. Default action: sync everything.

### Step 2: Copy Cowork → Repo

For each skill in Cowork but not in the repo, copy using the `cat` redirect method (not `cp`):

```bash
# For each file in the source skill:
mkdir -p "$REPO_DIR/$skill/$(dirname $relpath)"
cat "$COWORK_DIR/$skill/$relpath" > "$REPO_DIR/$skill/$relpath"
```

Skip binary files (*.ttf, *.otf, *.woff*, *.jpg, *.jpeg, *.png, *.gif, *.ico, *.DS_Store).

Do this for:
- `.skills/skills/*` (Cowork standalone skills)
- `.local-plugins/marketplaces/local-desktop-app-uploads/*` (Cowork plugins)
- `.remote-plugins/plugin_*/` (remote plugins — use the plugin name from manifest.json)

### Step 3: Sync Overlapping Skills

For skills that exist in both Cowork and repo, check for differences:

```bash
diff -r "$COWORK_DIR/$skill" "$REPO_DIR/$skill"
```

If they differ, ask the user which direction to sync. Default: **Cowork is ground truth** for skills that originated there.

### Step 4: Package to Skill-Vault

For every skill directory in the repo, package it:

```bash
cd "$REPO_DIR"
zip -r /tmp/$skill.zip $skill/ -x "*__pycache__*" "*.pyc" "*.DS_Store"
cat /tmp/$skill.zip > "$VAULT_DIR/$skill.zip"
rm /tmp/$skill.zip
```

The `/tmp` intermediary is necessary because `zip` can't write directly to the vault filesystem.

### Step 5: Flag Cleanup Needed

Since we can't delete files from the vault, identify old duplicates for the user to clean up manually:
- `.skill` files that now have `.zip` versions
- `.md` files that now have `.zip` versions
- Renamed skills (old name still present)
- Temp files (orphaned fragments from failed zips)

Tell the user: "These files in your vault are old duplicates. You can delete them in Finder."

### Step 6: Final Verification

Run the inventory script one more time and confirm zero gaps between all three environments. Present a clean summary.

## What This Skill Cannot Do

Be upfront about these limitations:
- **Cannot install skills into Cowork** — `.skills/skills/` is read-only. Skills that only exist in the repo need to be installed through the Cowork UI or packaged as plugins.
- **Cannot delete old files from vault** — the filesystem blocks `rm`. The user must delete in Finder.
- **Cannot copy binary files** — fonts, images, and other binaries don't transfer between mounts. The user may need to manually copy these.

## Output

After sync completes, produce a summary:

```
SKILL SYNC COMPLETE
==================
Skills aligned:     48
Copied to repo:      4
Packaged to vault:   3
Duplicates flagged:  2 (delete in Finder)
Cannot auto-sync:    1 (repo-only — install in Cowork manually)
```
