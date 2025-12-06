# Document Export Guide

## Overview

DocuMind exports documents to Word (.docx) and PowerPoint (.pptx) formats with professional formatting and styling.

## DOCX Export Features

- Table of contents generation
- Professional heading hierarchy
- Justified text alignment
- Proper spacing and margins
- Page breaks between sections
- Meta information (author, created date)

### DOCX Structure

1. **Title Page**
   - Project title (Heading 1, centered)
   - Generation date
   - Separator

2. **Table of Contents**
   - Indexed list of all sections
   - Indented for readability

3. **Content Sections**
   - Each section starts with Heading 2
   - Paragraphs with 1.5 line spacing
   - 1-inch margins on all sides

4. **Formatting**
   - Primary font: Calibri
   - Title: 26pt bold
   - Headings: 14pt bold
   - Body: 11pt regular
   - Line height: 1.5

## PPTX Export Features

- Professional color scheme (blue/orange)
- Consistent slide styling
- Header bar on each content slide
- Slide numbering
- Brand footer ("DocuMind")
- Typography optimized for projection

### PPTX Slide Layouts

1. **Title Slide**
   - Primary color background
   - Large title text (54pt)
   - Generation date subtitle
   - 100% height utilization

2. **Content Slides**
   - White background
   - Colored header bar
   - Slide number in header
   - Main content area (75% of slide)
   - Footer with branding

### Color Scheme

\`\`\`
Primary Blue: #2563EB
Dark Gray: #1F2937
Light Gray: #F3F4F6
Accent Orange: #F97316
Text Primary: #111827
Text Light: #6B7280
\`\`\`

## File Naming

Exported files are automatically named based on project title:

\`\`\`
"My Business Plan" → my_business_plan.docx
"Q4 Strategy" → q4_strategy.pptx
\`\`\`

## Export API Response

\`\`\`typescript
// Successful export
Response 200 OK
Headers:
  Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Content-Disposition: attachment; filename="document.docx"
Body: Binary file content

// Export error
Response 500
{
  "message": "Failed to generate Word document"
}
\`\`\`

## Size Limitations

- **DOCX**: Up to 100MB (Office Open XML limit)
- **PPTX**: Up to 100MB (Office Open XML limit)
- **Per Section**: Recommended max 10,000 characters
- **Total Slides**: Recommended max 500 slides

## Compatibility

### DOCX Compatibility

- Microsoft Word 2007+
- Google Docs
- LibreOffice
- Apple Pages
- Online viewers (OneDrive, Google Drive)

### PPTX Compatibility

- Microsoft PowerPoint 2007+
- Google Slides
- LibreOffice Impress
- Apple Keynote
- Online viewers (OneDrive, Google Drive)

## Troubleshooting

### Export fails with "Context length exceeded"

**Problem**: Total content is too large
**Solution**: Generate fewer sections or split into multiple documents

### Formatting looks different in Office

**Problem**: Office version applies different font rendering
**Solution**: Formats are standards-compliant; appearance varies by application

### Slide text is cut off

**Problem**: Content exceeds slide boundaries
**Solution**: Keep section content under 2000 characters

## Best Practices

1. **Content Length**: Keep each section 200-500 words for optimal formatting
2. **Titles**: Use clear, descriptive section titles (under 60 characters)
3. **Formatting**: Avoid special characters in project titles
4. **Testing**: Download and verify in your target application
5. **Sharing**: Use standard sharing methods (email, cloud storage)
