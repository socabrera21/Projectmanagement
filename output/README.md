# Professional Headshot Enhancer Skill

## 🎉 Your skill is ready!

A complete Claude Code skill for transforming casual photos into professional LinkedIn and corporate headshots.

## 📦 What's Included

### Files in this directory:
- **headshot-enhancer.skill** - The packaged skill file (ready to install)
- **INSTALLATION.md** - Complete installation and usage guide
- **README.md** - This file

## ✨ Features

Your headshot enhancer skill provides:

1. **Intelligent Background Removal**
   - AI-powered removal with rembg (optional)
   - Fallback OpenCV GrabCut algorithm (works without additional dependencies)

2. **Professional Background Colors**
   - White (LinkedIn standard)
   - Light Gray (subtle professional)
   - Navy (traditional corporate)
   - Corporate Blue (business)
   - Slate (modern)
   - Charcoal (executive)

3. **Advanced Enhancements**
   - Automatic lighting and color correction
   - Skin retouching (subtle and natural)
   - Professional cropping (1:1 LinkedIn format)
   - Image sharpening
   - Resolution optimization

4. **Multiple Variations**
   - Generates 8+ professional versions
   - Different backgrounds and enhancement levels
   - Easy comparison to choose the best

## 🚀 Quick Start

### 1. Install the Skill

Place `headshot-enhancer.skill` in your Claude skills directory, or use Claude's skill installation command.

### 2. Install Dependencies

**Core (Required):**
```bash
pip install pillow opencv-python numpy
```

**AI Background Removal (Optional, Recommended):**
```bash
pip install onnxruntime rembg
```

### 3. Use It!

Simply ask Claude:
- "Make this photo look more professional"
- "Create a LinkedIn headshot from this photo"
- "Transform this into a professional corporate photo"

Claude will automatically:
- Enhance lighting and colors
- Remove the background
- Apply professional backgrounds
- Create multiple variations
- Output high-quality results

## 📸 Example Usage

**Upload a casual photo and ask:**

```
"Make this photo look more professional with better lighting"
```

**Claude will create:**
- photo_standard_white.jpg
- photo_standard_light-gray.jpg
- photo_standard_navy.jpg
- photo_standard_corporate-blue.jpg
- photo_enhanced_white.jpg
- photo_enhanced_light-gray.jpg
- photo_enhanced_navy.jpg
- photo_enhanced_corporate-blue.jpg

## 🎯 Enhancement Levels

- **Subtle**: Minimal retouching, very natural look
- **Standard**: Professional polish (recommended for most)
- **Enhanced**: Maximum quality improvement

## 📋 Requirements

- Python 3.8+
- pillow (image processing)
- opencv-python (computer vision)
- numpy (numerical operations)
- onnxruntime (optional, for AI features)
- rembg (optional, for superior background removal)

## 💡 Tips for Best Results

1. **Source Photo Quality**: Higher quality inputs produce better outputs
2. **Good Lighting**: While the skill fixes lighting, decent starting lighting helps
3. **Clear Separation**: Photos with clear subject-background separation work best
4. **Face Visible**: Ensure your face is clearly visible and in focus

## 🔧 Technical Details

The skill includes:
- **SKILL.md**: Complete skill documentation and workflows
- **scripts/enhance_headshot.py**: Main enhancement engine (260+ lines)
- **references/headshot-standards.md**: Professional guidelines and standards
- **scripts/requirements.txt**: Dependency specification

## 📖 For More Information

See `INSTALLATION.md` for:
- Detailed installation instructions
- Usage examples
- Troubleshooting guide
- Output specifications

## 🎨 Professional Standards

The skill follows industry standards for:
- LinkedIn profile photos (1:1 aspect, 1000x1000px)
- Corporate headshots (professional backgrounds)
- Color correction and retouching
- Composition and framing

---

**Created with Claude Code Skill Creator**

Enjoy creating professional headshots instantly! 📷✨
