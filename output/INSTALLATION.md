# Headshot Enhancer Skill - Installation Guide

## What This Skill Does

The **headshot-enhancer** skill transforms casual photos into professional headshots suitable for LinkedIn and corporate use. It provides:

- **Background Removal & Replacement**: AI-powered background removal with corporate color options
- **Lighting Enhancement**: Automatic brightness, contrast, and color correction
- **Face Retouching**: Subtle skin smoothing and blemish removal
- **Professional Cropping**: LinkedIn-standard framing (1:1 aspect ratio)
- **Multiple Variations**: Generate 8+ professional versions to choose from

## Installation

### Step 1: Install the Skill

In Claude Code, use the skill installation command:

```bash
/install-skill headshot-enhancer.skill
```

Or manually place the `.skill` file in your `~/.claude/skills/` directory.

### Step 2: Install Python Dependencies

The skill requires Python packages. Install the core dependencies:

```bash
pip install pillow opencv-python numpy
```

Or use the included requirements file:

```bash
pip install -r ~/.claude/skills/headshot-enhancer/scripts/requirements.txt
```

**Optional - AI Background Removal** (Recommended for best results):

For advanced AI-powered background removal, also install:

```bash
pip install onnxruntime rembg
```

**Note**:
- The skill works without `rembg` using OpenCV's GrabCut algorithm
- Installing `rembg` provides better background removal quality
- On first use with `rembg`, it will download an AI model (~176MB)

## Usage

Once installed, simply ask Claude to enhance your photos:

### Example Requests

**Create multiple professional variations:**
```
"Make this photo look more professional with better lighting"
"Transform this into a professional LinkedIn headshot"
"Create professional variations of this photo"
```

**Specific requirements:**
```
"I need a LinkedIn headshot with a white background"
"Give me a corporate headshot with navy background"
"Enhance this photo with subtle retouching"
```

**Upload your photo** (JPG, PNG, HEIC) and Claude will automatically:
1. Enhance the lighting and colors
2. Remove the background
3. Apply professional background colors
4. Retouch skin (subtle and natural)
5. Crop to LinkedIn standards
6. Generate multiple variations for you to choose from

## Output

The skill creates organized professional variations:

```
headshots_output/
├── yourphoto_standard_white.jpg
├── yourphoto_standard_light-gray.jpg
├── yourphoto_standard_navy.jpg
├── yourphoto_standard_corporate-blue.jpg
├── yourphoto_enhanced_white.jpg
├── yourphoto_enhanced_light-gray.jpg
├── yourphoto_enhanced_navy.jpg
└── yourphoto_enhanced_corporate-blue.jpg
```

**Enhancement levels:**
- **Standard**: Professional polish (recommended)
- **Enhanced**: Maximum quality improvement

**Background colors:**
- **White**: Clean, modern (best for LinkedIn)
- **Light Gray**: Subtle professional
- **Navy**: Traditional corporate
- **Corporate Blue**: Business professional

## Tips for Best Results

1. **Use high-quality source photos** - The better the input, the better the output
2. **Ensure good lighting** - While the skill fixes lighting, starting with decent lighting helps
3. **Clear background separation** - Photos where you're clearly separated from the background work best
4. **Face clearly visible** - The AI works best when your face is clearly visible and in focus

## Troubleshooting

**"Module not found" errors:**
- Install the required Python packages: `pip install pillow opencv-python numpy rembg`

**Background removal artifacts:**
- The AI works best with clear subject-background separation. Complex backgrounds may need manual touch-up.

**Face looks over-smoothed:**
- Request "subtle enhancement" or "minimal retouching"

**Colors look off:**
- The skill uses automatic white balance. Mention specific color preferences if needed.

## Examples

**Before:** Casual selfie with messy background
**After:** Professional headshot with clean white background, improved lighting, professional cropping

**Before:** Outdoor photo with distracting elements
**After:** Corporate headshot with navy background, enhanced lighting, LinkedIn-ready format

---

Enjoy creating professional headshots! This skill saves time and money compared to professional photography sessions while delivering LinkedIn and corporate-ready results.
