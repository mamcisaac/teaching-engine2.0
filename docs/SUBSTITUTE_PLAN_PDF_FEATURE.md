# One-Click Substitute Day Plan PDF Feature

## Overview
This feature enables teachers to generate comprehensive substitute teacher plans as PDF documents with a single click. The PDFs include class routines, emergency information, lesson plans, student notes, and recent teaching context from daybook entries.

## Features

### 🎯 One-Click PDF Export
- Instant PDF generation from any substitute plan
- Professional formatting with clear sections
- Optimized for printing (Letter format)
- Includes page numbers and headers

### 📋 Comprehensive Content
The generated PDF includes:

1. **Header Information**
   - Date and day of week
   - Teacher name and contact
   - Grade level and program
   - School information

2. **Emergency Information** (Highlighted)
   - Main office contact
   - Emergency contacts
   - Evacuation procedures
   - Lockdown procedures

3. **Daily Schedule**
   - Time-based activities
   - Transition notes
   - Special instructions

4. **Class Routines**
   - Morning routines
   - Transition procedures
   - Behavior management strategies
   - Dismissal procedures

5. **Detailed Lesson Plans**
   - Learning objectives
   - Materials needed
   - Step-by-step activities
   - Differentiation strategies
   - Assessment methods

6. **Important Student Information**
   - Medical alerts
   - Special accommodations
   - Parent notes
   - Behavioral considerations

7. **Recent Teaching Context**
   - What worked well in recent lessons
   - Current challenges
   - Notable achievements
   - Next steps from previous lessons

## Technical Implementation

### Backend Components

#### 1. SubstitutePlanPdfService (`server/src/services/substitutePlanPdfService.ts`)
- Aggregates data from multiple sources
- Generates HTML using Handlebars templates
- Converts HTML to PDF using Puppeteer
- Handles data formatting and organization

#### 2. PDF Export Endpoint (`server/src/routes/SubstitutePlansRouteHandler.ts`)
- Route: `GET /api/substitute-plans/:id/pdf`
- Authentication required
- Returns PDF as binary blob
- Sets appropriate headers for download

### Frontend Components

#### 1. SubstitutePlanCard (`client/src/components/SubstitutePlanCard.tsx`)
- Displays substitute plan information
- One-click PDF export button
- Loading states and error handling
- Automatic file download

#### 2. SubstitutePlansPage (`client/src/pages/SubstitutePlansPage.tsx`)
- Lists all substitute plans
- Filter options (active, upcoming)
- Grid layout with cards
- Quick tips for users

### Data Models Used

- `SubstitutePlan` - Main substitute plan data
- `ClassRoutine` - Classroom management routines
- `DaybookEntry` - Teaching reflections and notes
- `ETFOLessonPlan` - Detailed lesson plans
- `Student` - Student-specific information
- `User` - Teacher information

## Usage

### For Teachers

1. Navigate to the Substitute Plans page
2. Find the plan you want to export
3. Click the "Export PDF" button
4. PDF downloads automatically
5. Print or share with substitute teacher

### For Developers

#### Testing the Feature
```bash
# Run the test suite
cd server
npm test substitutePlanPdfService.test.ts

# Test the endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/substitute-plans/PLAN_ID/pdf \
  --output substitute-plan.pdf
```

#### Adding New Sections to PDF
1. Update `SubstitutePlanPdfService.fetchPlanData()` to fetch additional data
2. Modify the HTML template in `getHtmlTemplate()`
3. Add styling for new sections
4. Test PDF generation

## API Reference

### Export Substitute Plan as PDF
```
GET /api/substitute-plans/:id/pdf
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="substitute-plan-YYYY-MM-DD.pdf"`

**Error Responses:**
- `404` - Substitute plan not found
- `401` - Unauthorized
- `500` - PDF generation failed

## Benefits

1. **Time-Saving**: Generate comprehensive plans in seconds
2. **Consistency**: Standardized format for all substitute plans
3. **Completeness**: Automatically includes all relevant information
4. **Context-Aware**: Pulls in recent teaching notes and reflections
5. **Professional**: Clean, well-formatted PDFs ready for printing
6. **Safety-First**: Emergency information prominently displayed

## Future Enhancements

- [ ] Custom branding/logos
- [ ] Email PDF directly to substitutes
- [ ] Multiple language support
- [ ] Template customization options
- [ ] Batch export for multiple days
- [ ] QR codes for digital resources
- [ ] Integration with school management systems

## Troubleshooting

### PDF Generation Fails
- Check Puppeteer installation: `npm install puppeteer`
- Verify Chrome/Chromium is available
- Check server logs for detailed errors

### Missing Data in PDF
- Ensure class routines are active
- Verify daybook entries exist
- Check lesson plans are linked to the date

### Download Issues
- Verify authentication token
- Check browser popup blocker settings
- Ensure adequate server resources

## Support
For issues or questions about this feature, please contact the development team or create an issue in the project repository.