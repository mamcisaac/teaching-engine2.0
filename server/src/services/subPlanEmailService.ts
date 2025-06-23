import { prisma } from '../prisma';
import { sendEmail } from './emailService';
import { generateSubPlan, SubPlanOptions } from './subPlanService';

export interface SubPlanEmailOptions extends SubPlanOptions {
  date: string;
  days?: number;
  recipientEmail: string;
  teacherName: string;
  schoolName?: string;
  additionalMessage?: string;
}

export async function sendSubPlanEmail(options: SubPlanEmailOptions): Promise<void> {
  const { recipientEmail, teacherName, schoolName, additionalMessage, ...subPlanOptions } = options;
  
  // Generate the PDF
  const pdfBuffer = await generateSubPlan(options.date, options.days, subPlanOptions);
  
  // Format date range
  const startDate = new Date(options.date);
  const endDate = new Date(options.date);
  endDate.setDate(endDate.getDate() + options.days - 1);
  
  const dateRangeStr = options.days === 1 
    ? startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  
  // Create email subject
  const subject = `Substitute Plan for ${teacherName} - ${dateRangeStr}`;
  
  // Create email body
  const emailBody = `
    <h2>Substitute Teaching Plan</h2>
    
    <p>Dear Substitute Teacher,</p>
    
    <p>Please find attached the substitute teaching plan for <strong>${teacherName}'s</strong> class${schoolName ? ` at ${schoolName}` : ''}.</p>
    
    <p><strong>Coverage Period:</strong> ${dateRangeStr}</p>
    
    ${additionalMessage ? `
    <p><strong>Additional Notes from ${teacherName}:</strong></p>
    <p>${additionalMessage}</p>
    ` : ''}
    
    <p>The attached PDF contains:</p>
    <ul>
      ${options.includePlans !== false ? '<li>Daily schedule and activities</li>' : ''}
      ${options.includeGoals ? '<li>Current student learning goals</li>' : ''}
      ${options.includeRoutines ? '<li>Classroom routines and procedures</li>' : ''}
      <li>Emergency contacts and procedures</li>
      <li>Fallback activities and resources</li>
    </ul>
    
    <p>If you have any questions or need clarification, please contact the school office.</p>
    
    <p>Thank you for stepping in to support our students!</p>
    
    <hr>
    <p style="font-size: 12px; color: #666;">
      This substitute plan was generated on ${new Date().toLocaleDateString()} using Teaching Engine 2.0.
      ${options.anonymize ? 'Student names have been anonymized for privacy.' : ''}
    </p>
  `;
  
  // Send email with PDF attachment
  await sendEmail(
    recipientEmail,
    subject,
    emailBody,
    emailBody,
    {
      filename: `sub-plan-${options.date}.pdf`,
      content: pdfBuffer
    }
  );
}

export async function sendSubPlanReminder(teacherId: number, daysAhead: number = 1): Promise<void> {
  // Get teacher 
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId }
  });
  
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  
  // Get teacher preferences separately
  const teacherPreferences = await prisma.teacherPreferences.findUnique({
    where: { id: teacherId }
  });
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + daysAhead);
  
  // Check if teacher has any unavailable blocks coming up
  const upcomingAbsence = await prisma.unavailableBlock.findFirst({
    where: {
      date: tomorrow,
      blockType: 'TEACHER_ABSENCE'
    }
  });
  
  if (upcomingAbsence) {
    // Send reminder email
    const subject = `Reminder: Prepare Substitute Plan for ${tomorrow.toLocaleDateString()}`;
    
    const emailBody = `
      <h2>Substitute Plan Reminder</h2>
      
      <p>Dear ${teacher.name},</p>
      
      <p>This is a reminder that you have an upcoming absence on <strong>${tomorrow.toLocaleDateString()}</strong>.</p>
      
      <p>Please remember to prepare your substitute plan. You can generate it quickly using the Emergency Sub Plan feature in Teaching Engine 2.0.</p>
      
      <p><a href="${process.env.APP_URL}/planner?openSubPlan=true" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Generate Sub Plan Now</a></p>
      
      <p>Best regards,<br>Teaching Engine 2.0</p>
    `;
    
    await sendEmail(
      teacher.email,
      subject,
      emailBody,
      emailBody
    );
  }
}