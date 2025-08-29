# ETFO Student Assessment System - User Guide

## Getting Started with Student Assessment

### Overview
The ETFO Student Assessment System helps you track Grade 1 French Immersion student progress using the Growing Success framework. This guide will walk you through all features.

## Initial Setup

### 1. Enable Assessment Features
Add to your `.env` file:
```env
FEATURE_STUDENT_ASSESSMENT=true
```

### 2. Import Your Class List
1. Navigate to **Students** → **Import Students**
2. Upload CSV file with format:
   ```csv
   firstName,lastName,studentId,dateOfBirth
   Sophie,Martin,SM001,2018-03-15
   Lucas,Tremblay,LT002,2018-06-22
   ```
3. Review and confirm import

## Core Features

### Managing Students

#### Adding Individual Students
1. Click **Add Student** button
2. Enter student information:
   - First Name
   - Last Name
   - Student ID
   - Date of Birth
   - Notes (optional)
3. Click **Save**

#### Editing Student Information
1. Click on student name in list
2. Update information as needed
3. Click **Save Changes**

### Recording Assessments

#### Quick Assessment Entry
1. Select student from dropdown
2. Choose curriculum expectation
3. Select mastery level:
   - **Not Yet** - Hasn't demonstrated understanding
   - **Approaching** - Beginning to show understanding
   - **Meeting** - Meets grade-level expectations
   - **Exceeding** - Exceeds expectations
4. Choose evidence type:
   - **Observation** - What you observed
   - **Conversation** - Discussion with student
   - **Product** - Student work sample
5. Add notes (optional)
6. Click **Record Assessment**

#### Uploading Student Work
1. Click **Upload Artifact**
2. Select file(s):
   - Images (JPG, PNG)
   - Documents (PDF, DOCX)
   - Videos (MP4, MOV)
   - Audio (MP3, WAV)
3. Tag with curriculum expectations
4. Add assessment notes
5. Click **Upload**

### Viewing Progress

#### Individual Student View
1. Navigate to **Students** → Select student
2. View timeline of assessments
3. See mastery progression charts
4. Review evidence portfolio

#### Class Analytics Dashboard
1. Navigate to **Analytics**
2. View metrics:
   - Class mastery distribution
   - Evidence triangulation balance
   - Subject area progress
   - Growth over time

### Generating Reports

#### Progress Reports
1. Navigate to **Reports**
2. Select report type:
   - Individual Progress Report
   - Class Summary Report
   - Evidence Portfolio
3. Choose date range
4. Select format (PDF/CSV)
5. Click **Generate Report**

#### Quick Exports
- Click **Export** icon on any view
- Choose format and download

## Assessment Best Practices

### Evidence Triangulation
Balance your assessments across all three types:
- **Observations** (33%) - Daily classroom observations
- **Conversations** (33%) - One-on-one discussions
- **Products** (33%) - Student work samples

### Frequency Guidelines
- Record at least 2-3 assessments per student per week
- Focus on different curriculum areas
- Document both formative and summative assessments

### Using Mastery Levels

#### Not Yet
Use when student:
- Shows no understanding of concept
- Cannot complete task even with support
- Needs significant intervention

#### Approaching
Use when student:
- Shows partial understanding
- Completes task with guidance
- Makes frequent errors

#### Meeting
Use when student:
- Demonstrates grade-level understanding
- Completes tasks independently
- Makes occasional minor errors

#### Exceeding
Use when student:
- Goes beyond expectations
- Applies learning in new contexts
- Helps peers understand concepts

## Tips and Tricks

### Bulk Operations
- Select multiple students with checkboxes
- Apply same assessment to group
- Useful for whole-class activities

### Quick Entry Shortcuts
- Press `Tab` to move between fields
- Use number keys 1-4 for mastery levels
- Press `Enter` to save and continue

### Smart Filtering
- Filter by subject area
- View specific date ranges
- Search by student name
- Filter by mastery level

## Common Workflows

### Weekly Assessment Routine
1. **Monday**: Review previous week's data
2. **Tuesday-Thursday**: Record daily observations
3. **Friday**: Upload student work, generate weekly summary

### Parent-Teacher Conference Prep
1. Generate individual progress reports
2. Create evidence portfolio
3. Print mastery progression charts
4. Prepare talking points from notes

### Report Card Season
1. Run comprehensive reports
2. Review evidence triangulation
3. Identify gaps in assessment
4. Generate final summaries

## Troubleshooting

### Can't Upload Files?
- Check file size (max 10MB)
- Verify file format is supported
- Ensure stable internet connection

### Missing Students?
- Check import was successful
- Verify CSV format
- Look in archived students

### Reports Not Generating?
- Allow time for processing
- Check date range has data
- Verify student has assessments

## Privacy & Security

### Data Protection
- All data stored locally
- No cloud synchronization
- Encrypted at rest
- Regular backups recommended

### Access Control
- Teacher-only access
- No parent portal
- Secure authentication required
- Session timeout after inactivity

## Support Resources

### Getting Help
- Built-in help tooltips
- Video tutorials (coming soon)
- Contact support: support@teaching-engine.com

### Training Materials
- Quick start guide
- Best practices document
- Sample assessment scenarios
- Template library

## Appendix

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New assessment
- `Ctrl/Cmd + S` - Save current
- `Ctrl/Cmd + F` - Search students
- `Ctrl/Cmd + P` - Print view
- `Esc` - Close modal

### File Format Requirements
- **Images**: JPG, PNG (max 5MB)
- **Documents**: PDF, DOCX (max 10MB)
- **Videos**: MP4, MOV (max 50MB)
- **Audio**: MP3, WAV (max 20MB)

### CSV Import Format
```csv
firstName,lastName,studentId,dateOfBirth,grade,notes
Sophie,Martin,SM001,2018-03-15,1,French Immersion
Lucas,Tremblay,LT002,2018-06-22,1,French Immersion
```

---

*Last Updated: August 2025*
*Version: 1.0.0*