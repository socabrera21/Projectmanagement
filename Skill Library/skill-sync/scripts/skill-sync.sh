#!/bin/bash
# skill-sync.sh — Audit and sync skills across Cowork, Claude Code repo, and skill-vault
#
# Usage: bash skill-sync.sh [ACTION] [--repo PATH] [--vault PATH]
#
# Actions (pick one):
#   --inventory-only   Just report gaps, don't change anything (default)
#   --sync             Copy missing skills to repo (Cowork → repo)
#   --package          Package all repo skills to skill-vault
#   --all              Do everything (sync + package + verify)
#
# Required folder arguments:
#   --repo PATH        Path to the Claude Code repo folder (must contain a skills/ subdirectory)
#   --vault PATH       Path to the skill-vault folder (where .zip backups live)
#
# Examples:
#   bash skill-sync.sh --inventory-only --repo /sessions/.../mnt/data_content_creation --vault /sessions/.../mnt/skill-vault
#   bash skill-sync.sh --all --repo /sessions/.../mnt/data_content_creation --vault /sessions/.../mnt/skill-vault

set -uo pipefail

# --- Argument Parsing ---
ACTION="--inventory-only"
REPO_BASE=""
VAULT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --inventory-only|--sync|--package|--all)
      ACTION="$1"; shift ;;
    --repo)
      REPO_BASE="$2"; shift 2 ;;
    --vault)
      VAULT="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# --- Path Detection ---
# Find the current session root by looking for .skills/skills/ (always present in Cowork)
SESSION_ROOT=""
for d in /sessions/*/mnt/.skills/skills; do
  if [ -d "$d" ]; then
    SESSION_ROOT=$(dirname $(dirname $(dirname "$d")))
    break
  fi
done

if [ -z "$SESSION_ROOT" ]; then
  echo "ERROR: Cannot find a Cowork session. Are you running inside Cowork?"
  exit 1
fi

MNT="$SESSION_ROOT/mnt"

# Cowork skill sources (read-only, always auto-detected)
COWORK_SKILLS="$MNT/.skills/skills"
COWORK_PLUGINS="$MNT/.local-plugins/marketplaces/local-desktop-app-uploads"
COWORK_REMOTE="$MNT/.remote-plugins"

# --- Auto-detect repo and vault if not provided ---
# Scan mounted user folders (skip hidden dirs like .skills, .local-plugins, etc.)
if [ -z "$REPO_BASE" ] || [ -z "$VAULT" ]; then
  for d in "$MNT"/*/; do
    dirname=$(basename "$d")
    # Skip hidden/system dirs
    case "$dirname" in
      .*|uploads) continue ;;
    esac

    # A folder with a skills/ subdir containing SKILL.md files is likely the repo
    if [ -z "$REPO_BASE" ] && [ -d "$d/skills" ]; then
      skill_md_count=$(find "$d/skills" -maxdepth 2 -name "SKILL.md" 2>/dev/null | head -5 | wc -l)
      if [ "$skill_md_count" -gt 0 ]; then
        REPO_BASE="$d"
      fi
    fi

    # A folder with .zip files is likely the vault
    if [ -z "$VAULT" ]; then
      zip_count=$(find "$d" -maxdepth 1 -name "*.zip" 2>/dev/null | head -3 | wc -l)
      if [ "$zip_count" -gt 0 ]; then
        VAULT="$d"
      fi
    fi
  done
fi

# Validate
if [ -z "$REPO_BASE" ]; then
  echo "ERROR: Could not find the Claude Code repo folder."
  echo "  Either mount it in Cowork or pass --repo /path/to/folder"
  echo "  (The folder should contain a skills/ subdirectory with SKILL.md files)"
  exit 1
fi

if [ -z "$VAULT" ]; then
  echo "ERROR: Could not find the skill-vault folder."
  echo "  Either mount it in Cowork or pass --vault /path/to/folder"
  echo "  (The folder should contain .zip files of packaged skills)"
  exit 1
fi

# Ensure repo has a skills/ subdir
REPO_SKILLS="$REPO_BASE/skills"
if [ ! -d "$REPO_SKILLS" ]; then
  REPO_SKILLS="$REPO_BASE"  # Maybe they pointed directly at the skills dir
fi

echo "Using repo:  $REPO_BASE"
echo "Using vault: $VAULT"
echo ""

# --- Helper Functions ---

count_files() {
  local dir="$1"
  find "$dir" -type f 2>/dev/null | grep -v '.DS_Store' | wc -l | tr -d ' '
}

has_skill_md() {
  [ -f "$1/SKILL.md" ] && echo "Y" || echo "N"
}

# Copy a skill from a read-only mount to a writable destination using cat redirects.
# Skips binary files that can't cross mount boundaries.
copy_skill_via_cat() {
  local src="$1"
  local dst="$2"
  local skill_name=$(basename "$src")
  local count=0

  while IFS= read -r filepath; do
    local relpath="${filepath#$src/}"

    # Skip binary files
    case "$relpath" in
      *.ttf|*.otf|*.woff|*.woff2|*.jpg|*.jpeg|*.png|*.gif|*.ico|*.DS_Store|*.pyc) continue ;;
    esac

    local destfile="$dst/$relpath"
    local destdir=$(dirname "$destfile")
    mkdir -p "$destdir" 2>/dev/null
    cat "$filepath" > "$destfile" 2>/dev/null && count=$((count + 1))
  done < <(find "$src" -type f 2>/dev/null)

  echo "$count"
}

# Package a skill folder into a .zip in the vault via /tmp intermediary
package_to_vault() {
  local skill="$1"
  local src_dir="$REPO_SKILLS"

  cd "$src_dir"
  zip -r "/tmp/${skill}.zip" "$skill/" -x "*__pycache__*" "*.pyc" "*.DS_Store" > /dev/null 2>&1
  cat "/tmp/${skill}.zip" > "$VAULT/${skill}.zip" 2>/dev/null
  rm -f "/tmp/${skill}.zip" 2>/dev/null
}

# --- Phase 1: Inventory ---

echo "============================================"
echo "  SKILL SYNC — INVENTORY"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "============================================"
echo ""

# Collect all skill names from each source
declare -A cowork_skills
declare -A plugin_skills
declare -A remote_plugins
declare -A repo_skills
declare -A vault_skills

# Cowork standalone skills
if [ -d "$COWORK_SKILLS" ]; then
  for d in "$COWORK_SKILLS"/*/; do
    [ -d "$d" ] && cowork_skills[$(basename "$d")]=1
  done
fi

# Cowork plugins
if [ -d "$COWORK_PLUGINS" ]; then
  for d in "$COWORK_PLUGINS"/*/; do
    [ -d "$d" ] && plugin_skills[$(basename "$d")]=1
  done
fi

# Remote plugins (use name from manifest.json)
if [ -f "$COWORK_REMOTE/manifest.json" ]; then
  while IFS= read -r name; do
    remote_plugins["$name"]=1
  done < <(python3 -c "
import json, sys
try:
    data = json.load(open('$COWORK_REMOTE/manifest.json'))
    for p in data.get('plugins', []):
        print(p['name'])
except: pass
" 2>/dev/null)
fi

# Repo skills
if [ -d "$REPO_SKILLS" ]; then
  for d in "$REPO_SKILLS"/*/; do
    [ -d "$d" ] && repo_skills[$(basename "$d")]=1
  done
fi

# Vault zips
if [ -d "$VAULT" ]; then
  for f in "$VAULT"/*.zip; do
    [ -f "$f" ] && vault_skills[$(basename "$f" .zip)]=1
  done
fi

# --- Report ---

echo "COUNTS:"
echo "  Cowork skills:    ${#cowork_skills[@]}"
echo "  Cowork plugins:   ${#plugin_skills[@]}"
echo "  Remote plugins:   ${#remote_plugins[@]}"
echo "  Repo skills:      ${#repo_skills[@]}"
echo "  Vault zips:       ${#vault_skills[@]}"
echo ""

# Cowork skills NOT in repo
echo "--- COWORK SKILLS NOT IN REPO (need copying) ---"
cowork_missing=0
for skill in "${!cowork_skills[@]}"; do
  if [ -z "${repo_skills[$skill]+x}" ]; then
    files=$(count_files "$COWORK_SKILLS/$skill")
    echo "  $skill ($files files)"
    cowork_missing=$((cowork_missing + 1))
  fi
done
for skill in "${!plugin_skills[@]}"; do
  if [ -z "${repo_skills[$skill]+x}" ]; then
    files=$(count_files "$COWORK_PLUGINS/$skill")
    echo "  $skill [plugin] ($files files)"
    cowork_missing=$((cowork_missing + 1))
  fi
done
[ $cowork_missing -eq 0 ] && echo "  None — fully aligned!"
echo ""

# Repo skills NOT in Cowork (informational only — can't auto-install)
echo "--- REPO SKILLS NOT IN COWORK (repo-only) ---"
repo_only=0
for skill in "${!repo_skills[@]}"; do
  if [ -z "${cowork_skills[$skill]+x}" ] && [ -z "${plugin_skills[$skill]+x}" ]; then
    files=$(count_files "$REPO_SKILLS/$skill")
    [ "$files" -eq 0 ] && continue  # skip empty dirs
    echo "  $skill ($files files)"
    repo_only=$((repo_only + 1))
  fi
done
[ $repo_only -eq 0 ] && echo "  None — fully aligned!"
echo ""

# Repo skills NOT in vault
echo "--- REPO SKILLS NOT IN VAULT (need packaging) ---"
vault_missing=0
for skill in "${!repo_skills[@]}"; do
  files=$(count_files "$REPO_SKILLS/$skill")
  [ "$files" -eq 0 ] && continue
  if [ -z "${vault_skills[$skill]+x}" ]; then
    echo "  $skill ($files files)"
    vault_missing=$((vault_missing + 1))
  fi
done
[ $vault_missing -eq 0 ] && echo "  None — fully aligned!"
echo ""

# Overlapping skills with differences
echo "--- OVERLAPPING SKILLS (checking for drift) ---"
drift_count=0
for skill in "${!cowork_skills[@]}"; do
  if [ -n "${repo_skills[$skill]+x}" ]; then
    diff_output=$(diff -rq "$COWORK_SKILLS/$skill" "$REPO_SKILLS/$skill" 2>/dev/null | grep -v '.DS_Store' | head -5)
    if [ -n "$diff_output" ]; then
      echo "  DRIFT: $skill"
      echo "$diff_output" | sed 's/^/    /'
      drift_count=$((drift_count + 1))
    fi
  fi
done
[ $drift_count -eq 0 ] && echo "  None — all overlapping skills match!"
echo ""

# Vault duplicates (old formats alongside new zips)
echo "--- VAULT DUPLICATES (old formats to clean up) ---"
dup_count=0
for f in "$VAULT"/*.skill "$VAULT"/*.md; do
  [ ! -f "$f" ] && continue
  base=$(basename "$f" | sed 's/\.\(skill\|md\)$//')
  if [ -f "$VAULT/$base.zip" ]; then
    echo "  OLD: $(basename $f)  →  replaced by $base.zip"
    dup_count=$((dup_count + 1))
  fi
done
# Check for orphaned temp files
for f in "$VAULT"/zi*; do
  [ -f "$f" ] && echo "  TEMP: $(basename $f)" && dup_count=$((dup_count + 1))
done
[ $dup_count -eq 0 ] && echo "  None — vault is clean!"
echo ""

# --- Summary ---
echo "============================================"
echo "  SUMMARY"
echo "============================================"
echo "  Cowork → Repo gaps:  $cowork_missing"
echo "  Repo-only skills:    $repo_only (can't auto-install in Cowork)"
echo "  Vault gaps:          $vault_missing"
echo "  Skill drift:         $drift_count"
echo "  Vault duplicates:    $dup_count"
total_issues=$((cowork_missing + vault_missing + drift_count + dup_count))
if [ $total_issues -eq 0 ]; then
  echo ""
  echo "  ✓ ALL ENVIRONMENTS ALIGNED"
else
  echo ""
  echo "  $total_issues issue(s) found."
fi
echo "============================================"

# --- Phase 2: Sync (if requested) ---

if [ "$ACTION" = "--sync" ] || [ "$ACTION" = "--all" ]; then
  echo ""
  echo "SYNCING: Cowork → Repo..."
  synced=0

  # Copy Cowork standalone skills to repo
  for skill in "${!cowork_skills[@]}"; do
    if [ -z "${repo_skills[$skill]+x}" ]; then
      files_copied=$(copy_skill_via_cat "$COWORK_SKILLS/$skill" "$REPO_SKILLS/$skill")
      echo "  Copied: $skill ($files_copied files)"
      synced=$((synced + 1))
    fi
  done

  # Copy Cowork plugins to repo
  for skill in "${!plugin_skills[@]}"; do
    if [ -z "${repo_skills[$skill]+x}" ]; then
      files_copied=$(copy_skill_via_cat "$COWORK_PLUGINS/$skill" "$REPO_SKILLS/$skill")
      echo "  Copied plugin: $skill ($files_copied files)"
      synced=$((synced + 1))
    fi
  done

  # Copy remote plugins to repo (using name from manifest)
  # Use the manifest name directly. Only append "-plugin" if the name
  # would collide with an existing non-remote skill (e.g., "marketing"
  # the skill vs "marketing" the remote plugin).
  if [ -f "$COWORK_REMOTE/manifest.json" ]; then
    while IFS= read -r line; do
      name=$(echo "$line" | cut -d'|' -f1)
      id=$(echo "$line" | cut -d'|' -f2)

      # Use the manifest name as-is, unless it collides with a Cowork
      # skill or local plugin that's a different thing.
      dest_name="$name"
      if [ -n "${cowork_skills[$name]+x}" ] || [ -n "${plugin_skills[$name]+x}" ]; then
        dest_name="${name}-plugin"
      fi

      if [ -z "${repo_skills[$dest_name]+x}" ] && [ -d "$COWORK_REMOTE/$id" ]; then
        files_copied=$(copy_skill_via_cat "$COWORK_REMOTE/$id" "$REPO_SKILLS/$dest_name")
        echo "  Copied remote: $dest_name ($files_copied files)"
        synced=$((synced + 1))
      fi
    done < <(python3 -c "
import json
data = json.load(open('$COWORK_REMOTE/manifest.json'))
for p in data.get('plugins', []):
    print(f\"{p['name']}|{p['id']}\")
" 2>/dev/null)
  fi

  echo "  Synced: $synced skills"
fi

# --- Phase 3: Package to Vault (if requested) ---

if [ "$ACTION" = "--package" ] || [ "$ACTION" = "--all" ]; then
  echo ""
  echo "PACKAGING: Repo → Vault..."
  packaged=0

  for d in "$REPO_SKILLS"/*/; do
    skill=$(basename "$d")
    files=$(count_files "$d")
    [ "$files" -eq 0 ] && continue

    package_to_vault "$skill"
    if [ -f "$VAULT/${skill}.zip" ]; then
      size=$(wc -c < "$VAULT/${skill}.zip" 2>/dev/null)
      echo "  Packaged: $skill.zip (${size}B)"
      packaged=$((packaged + 1))
    fi
  done

  echo "  Packaged: $packaged skills"
fi

# --- Phase 4: Final Verification (if --all) ---

if [ "$ACTION" = "--all" ]; then
  echo ""
  echo "VERIFYING..."

  final_gaps=0

  # Check Cowork → Repo
  for skill in "${!cowork_skills[@]}"; do
    files=$(count_files "$REPO_SKILLS/$skill" 2>/dev/null)
    [ "$files" -eq 0 ] && echo "  GAP: $skill not in repo" && final_gaps=$((final_gaps + 1))
  done
  for skill in "${!plugin_skills[@]}"; do
    files=$(count_files "$REPO_SKILLS/$skill" 2>/dev/null)
    [ "$files" -eq 0 ] && echo "  GAP: $skill (plugin) not in repo" && final_gaps=$((final_gaps + 1))
  done

  # Check Repo → Vault
  for d in "$REPO_SKILLS"/*/; do
    skill=$(basename "$d")
    files=$(count_files "$d")
    [ "$files" -eq 0 ] && continue
    [ ! -f "$VAULT/${skill}.zip" ] && echo "  GAP: $skill not in vault" && final_gaps=$((final_gaps + 1))
  done

  if [ $final_gaps -eq 0 ]; then
    echo "  ALL ENVIRONMENTS ALIGNED"
  else
    echo "  $final_gaps gap(s) remaining"
  fi
fi
