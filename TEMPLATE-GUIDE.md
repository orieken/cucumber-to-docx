# Cucumber to Word Document Template Guide

## Document Structure Overview

This guide shows the exact structure of the generated Word documents.

---

## Visual Template

### Page Layout
- **Margins:** 1 inch on all sides
- **Font:** Arial throughout
- **Page size:** Letter (8.5" × 11")

### Document Sections

#### 1. Feature Title
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Register a new pokemon to user account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- **Style:** Title (16pt, bold, left-aligned)
- **Spacing:** None before, 240 twips after

#### 2. Feature Description
```
Trainers want to be able to register new pokemon to their user accounts 
so that they can keep track of their collection. When new pokemon are 
registered, they should be associated with the correct user account and 
stored in the users library. A user can have multiple active pokemon 
teams, a pokemon is not active unless it is assigned to one of the teams.
```
- **Style:** Normal (11pt, italic)
- **Spacing:** 120 twips before, 240 twips after
- **Purpose:** Provides context for testers/auditors

#### 3. Scenario Heading
```
Scenario: Register a new pokemon to user account
```
- **Style:** Heading 1 (14pt, bold, left-aligned)
- **Spacing:** 360 twips before, 120 twips after

#### 4. Test Steps Table

```
┌─────────────────────────────────────────────────┬──────────────────────┬──────────────────────┐
│                     Step                        │   Expected Result    │    Actual Result     │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 1. Given I am a user with an active account  │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 2. And I am visiting                          │                      │                      │
│      "http://www.pokemon-trainer.hq"            │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 3. And on the pokeminHQ login enter           │                      │                      │
│      username "AshKetchum"                      │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 4. And on the pokeminHQ login enter           │                      │                      │
│      password "Pikachu123"                      │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 5. And I click on the "Login" button          │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 6. And I get redirected to the user           │                      │                      │
│      dashboard                                  │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 7. When I navigate to the "Add Pokemon"       │                      │                      │
│      section                                    │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 8. And I enter "Pikachu" in the "Pokemon      │                      │                      │
│      Name" field                                │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 9. And I select "Electric" from the "Type"    │                      │                      │
│      dropdown                                   │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 10. And I enter "25" in the "Level" field     │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 11. And I click on the "Register Pokemon"     │                      │                      │
│       button                                    │                      │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 12. Then I should see a confirmation          │ I should see a       │                      │
│       message "Pokemon registered               │ confirmation message │                      │
│       successfully!"                            │ "Pokemon registered  │                      │
│                                                 │ successfully!"       │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 13. And the new pokemon "Pikachu" should      │ the new pokemon      │                      │
│       be listed in my pokemon library           │ "Pikachu" should be  │                      │
│                                                 │ listed in my pokemon │                      │
│                                                 │ library              │                      │
├─────────────────────────────────────────────────┼──────────────────────┼──────────────────────┤
│ ☐ 14. And the pokemon "Pikachu" should not      │ the pokemon          │                      │
│       be assigned to any active team            │ "Pikachu" should not │                      │
│                                                 │ be assigned to any   │                      │
│                                                 │ active team          │                      │
└─────────────────────────────────────────────────┴──────────────────────┴──────────────────────┘
```

---

## Table Specifications

### Header Row
- **Background color:** Blue (#4472C4)
- **Text color:** White (#FFFFFF)
- **Font:** Arial 11pt, bold
- **Alignment:** Center
- **Borders:** Black, single line, 0.5pt

### Data Rows
- **Background color:** 
  - Step column: White
  - Expected Result column: Light gray (#F2F2F2)
  - Actual Result column: White
- **Font:** Arial 11pt
- **Borders:** Black, single line, 0.5pt
- **Cell padding:** 0.07" (100 twips) all sides

### Column Widths
| Column | Width (DXA) | Width (inches) | Percentage |
|--------|-------------|----------------|------------|
| Step | 4200 | 2.92" | ~45% |
| Expected Result | 2680 | 1.86" | ~27.5% |
| Actual Result | 2680 | 1.86" | ~27.5% |
| **Total** | **9560** | **6.64"** | **100%** |

Note: Total usable width on letter paper with 1" margins is 6.5"

---

## Step Numbering Format

### Pattern
```
☐ {number}. {step text}
```

### Examples
```
☐ 1. Given I am logged in
☐ 2. And I navigate to the dashboard
☐ 3. When I click on "Settings"
☐ 4. Then I should see the settings page
```

### Checkbox Character
- **Unicode:** U+2610 (☐)
- **Description:** Ballot Box
- **Purpose:** Can be manually checked with ☑ or ✓

### Numbering Rules
- Each scenario has **independent numbering** (resets to 1)
- Numbering is automatic via Word's list feature
- Indent: 0.5" left, 0.25" hanging

---

## Expected Result Population Logic

### Automatic Population
The "Expected Result" column is **automatically filled** for:
- `Then` steps
- `And` steps that follow `Then` steps

### Extraction Rules
1. Remove the keyword (`Then ` or `And `)
2. Keep the rest of the step text
3. Place in Expected Result column

### Examples

| Step | Expected Result Extracted |
|------|---------------------------|
| `Then I should see a success message` | `I should see a success message` |
| `Then the user should be redirected to "/dashboard"` | `the user should be redirected to "/dashboard"` |
| `And the page title should be "Dashboard"` | `the page title should be "Dashboard"` |

### Not Populated
- `Given` steps (preconditions)
- `When` steps (actions)
- `And` steps following `Given` or `When`

**Rationale:** Only assertion steps have clear expected outcomes

---

## Using the Document

### For Manual Testers

1. **Read the feature description** - Understand the context
2. **Execute each step in order**
   - Check off the checkbox as you complete each step
   - Perform the action described
3. **Record actual results**
   - Fill in what actually happened
   - Note any discrepancies from expected
4. **Flag issues**
   - Highlight rows where actual ≠ expected
   - Add notes in margins if needed

### For Auditors

1. **Review completeness** - All checkboxes should be checked
2. **Verify actual results** - Check they're filled in
3. **Compare actual vs expected** - Look for mismatches
4. **Request evidence** - Screenshots, logs, etc.
5. **Sign off** - Approve or request corrections

### For Test Leads

1. **Distribute to team** - Print or share digitally
2. **Track progress** - Check completion status
3. **Review results** - Analyze actual vs expected
4. **Update test cases** - Modify features if needed
5. **Archive** - Keep as test evidence

---

## Printing Tips

### Print Settings
- **Paper size:** Letter (8.5" × 11")
- **Orientation:** Portrait
- **Margins:** Normal (1" all sides)
- **Scale:** 100% (no scaling)

### For Best Results
1. Print from Microsoft Word (not Google Docs)
2. Enable "Print gridlines" for clearer tables
3. Use good quality paper for professional appearance
4. Consider double-sided printing to save paper
5. Staple multi-page documents

### Bulk Printing
- Print multiple scenarios separately
- Use page breaks between scenarios if combined
- Add cover sheet with test metadata:
  - Test date
  - Tester name
  - Environment
  - Build version

---

## Customization Examples

### Change Checkbox to Actual Checkbox Form Field

Replace the symbol with a Word checkbox form field for digital completion:

```javascript
// Instead of using numbering with "☐ %1."
// Use a custom paragraph with a checkbox symbol that can be edited
```

### Add Additional Columns

Modify the table to include more columns:

```javascript
// Example: Add "Notes" column
columnWidths: [3500, 2100, 2100, 1860],

// Add column to header row
new TableCell({
  // ... configuration ...
  children: [new Paragraph({ children: [new TextRun({ text: "Notes", ... })] })]
})
```

### Custom Color Schemes

Change header colors to match your branding:

```javascript
// Blue (default): #4472C4
// Green: #70AD47
// Orange: #FFC000
// Red: #E74C3C
// Purple: #9B59B6

shading: { fill: "70AD47", type: ShadingType.CLEAR }
```

---

## File Specifications

### Generated .docx File
- **Format:** Office Open XML (.docx)
- **Compatibility:** Microsoft Word 2007+
- **File size:** Typically 10-50 KB per scenario
- **Embedded fonts:** None (uses system fonts)

### Feature Requirements
- **Format:** Plain text with .feature extension
- **Encoding:** UTF-8
- **Line endings:** LF or CRLF (both supported)
- **Syntax:** Standard Gherkin/Cucumber

---

## Quality Checklist

Before distributing generated documents, verify:

- ✓ Feature title displays correctly
- ✓ Description is readable and complete
- ✓ All scenarios are present
- ✓ Step numbering is sequential within each scenario
- ✓ Checkboxes render properly
- ✓ Expected results are populated for assertions
- ✓ Table formatting is clean and professional
- ✓ Document opens in Microsoft Word without errors
- ✓ Text is not cut off in any cells
- ✓ Page breaks are appropriate

---

## Version History

- **v1.0** - Initial release
  - Basic feature file parsing
  - Table generation with 3 columns
  - Checkbox numbering
  - Expected result extraction

---

For more information, see **CUCUMBER-TO-DOCX-README.md**
