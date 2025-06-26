
export interface ContactInfo {
  id: string;
  name: string;
  role: string;
  phone: string;
  extension?: string;
  email?: string;
  location?: string;
  availability: string;
  priority: 'emergency' | 'urgent' | 'normal' | 'info';
  category: 'administration' | 'support' | 'medical' | 'safety' | 'technical' | 'transportation';
}

export interface ExtractedContacts {
  emergency: ContactInfo[];
  administration: ContactInfo[];
  support: ContactInfo[];
  technical: ContactInfo[];
  medical: ContactInfo[];
  transportation: ContactInfo[];
  custom: ContactInfo[];
}

/**
 * Extract and organize all relevant contact information for substitute teachers
 */
export async function extractSchoolContacts(userId: number = 1): Promise<ExtractedContacts> {
  // Get school information if available
  const schoolInfo = await getSchoolInformation();

  // Get custom contacts from class routines (emergency contacts)
  // TODO: Implement custom contact storage in ClassRoutine or User model
  const customContacts: ContactInfo[] = [];

  // Combine default school contacts with custom ones
  const allContacts = [...getDefaultSchoolContacts(), ...schoolInfo.contacts, ...customContacts];

  // Organize contacts by category
  const organizedContacts: ExtractedContacts = {
    emergency: allContacts.filter((c) => c.priority === 'emergency'),
    administration: allContacts.filter((c) => c.category === 'administration'),
    support: allContacts.filter((c) => c.category === 'support'),
    technical: allContacts.filter((c) => c.category === 'technical'),
    medical: allContacts.filter((c) => c.category === 'medical'),
    transportation: allContacts.filter((c) => c.category === 'transportation'),
    custom: customContacts,
  };

  return organizedContacts;
}

/**
 * Generate formatted contact list for substitute plans
 */
export function formatContactsForSubPlan(contacts: ExtractedContacts): string {
  const sections = [];

  // Emergency contacts first
  if (contacts.emergency.length > 0) {
    sections.push('🚨 EMERGENCY CONTACTS:');
    contacts.emergency.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Administration
  if (contacts.administration.length > 0) {
    sections.push('👥 ADMINISTRATION:');
    contacts.administration.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Support staff
  if (contacts.support.length > 0) {
    sections.push('🤝 SUPPORT STAFF:');
    contacts.support.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Technical support
  if (contacts.technical.length > 0) {
    sections.push('💻 TECHNICAL SUPPORT:');
    contacts.technical.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Medical
  if (contacts.medical.length > 0) {
    sections.push('🏥 MEDICAL:');
    contacts.medical.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Transportation
  if (contacts.transportation.length > 0) {
    sections.push('🚌 TRANSPORTATION:');
    contacts.transportation.forEach((contact) => {
      sections.push(formatContact(contact));
    });
    sections.push('');
  }

  // Custom contacts
  if (contacts.custom.length > 0) {
    sections.push('📞 ADDITIONAL CONTACTS:');
    contacts.custom.forEach((contact) => {
      sections.push(formatContact(contact));
    });
  }

  return sections.join('\n');
}

/**
 * Get emergency contacts only (for quick reference)
 */
export function getEmergencyContactsList(contacts: ExtractedContacts): string {
  const emergencyContacts = [
    ...contacts.emergency,
    ...contacts.administration.filter((c) => c.priority === 'urgent'),
    ...contacts.medical,
  ];

  if (emergencyContacts.length === 0) {
    return 'No emergency contacts configured. Contact main office.';
  }

  return emergencyContacts
    .map(
      (contact) =>
        `${contact.role}: ${contact.phone}${contact.extension ? ` ext. ${contact.extension}` : ''}`,
    )
    .join('\n');
}

/**
 * Update teacher's custom contacts
 */
export async function updateTeacherContacts(
  userId: number,
  contacts: Array<{ name: string; role: string; phone: string; notes?: string }>,
): Promise<void> {
  // TODO: Implement custom contact storage
  // Options:
  // 1. Store in User model as JSON field
  // 2. Store in ClassRoutine with category 'EMERGENCY_CONTACT'
  // 3. Create a new ContactInfo model
  
  console.warn('updateTeacherContacts is disabled - teacherPreferences model archived');
}

/**
 * Get school information from various sources
 */
async function getSchoolInformation(): Promise<{ contacts: ContactInfo[] }> {
  // In a real implementation, this might:
  // - Query a school directory database
  // - Pull from a district API
  // - Read from configuration files
  // - Import from school management system

  // For now, return a basic structure that can be extended
  return {
    contacts: [
      // These would be dynamically loaded in a real system
    ],
  };
}

/**
 * Extract custom contacts from teacher preferences
 */
function extractCustomContacts(subPlanContacts: unknown): ContactInfo[] {
  if (!subPlanContacts || typeof subPlanContacts !== 'object') {
    return [];
  }

  const contacts: ContactInfo[] = [];

  Object.entries(subPlanContacts as Record<string, string>).forEach(([role, info]) => {
    const contact = parseContactString(role, info);
    if (contact) {
      contacts.push(contact);
    }
  });

  return contacts;
}

/**
 * Parse contact string to extract information
 */
function parseContactString(role: string, info: string): ContactInfo | null {
  if (!info || typeof info !== 'string') return null;

  // Try to extract phone number
  const phoneMatch = info.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  const extMatch = info.match(/ext\.?\s*(\d+)/i);

  if (!phoneMatch) return null;

  const phone = phoneMatch[1];
  const extension = extMatch ? extMatch[1] : undefined;

  // Extract name (text before the phone number)
  const namePart = info
    .substring(0, phoneMatch.index)
    .replace(/[-\s]+$/, '')
    .trim();
  const name = namePart || role;

  return {
    id: `custom-${role.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    role,
    phone,
    extension,
    availability: 'School hours',
    priority: determinePriority(role),
    category: determineCategory(role),
  };
}

/**
 * Determine contact priority based on role
 */
function determinePriority(role: string): 'emergency' | 'urgent' | 'normal' | 'info' {
  const lowerRole = role.toLowerCase();

  if (lowerRole.includes('emergency') || lowerRole.includes('911')) {
    return 'emergency';
  }
  if (
    lowerRole.includes('principal') ||
    lowerRole.includes('nurse') ||
    lowerRole.includes('security')
  ) {
    return 'urgent';
  }
  if (
    lowerRole.includes('office') ||
    lowerRole.includes('secretary') ||
    lowerRole.includes('admin')
  ) {
    return 'urgent';
  }

  return 'normal';
}

/**
 * Determine contact category based on role
 */
function determineCategory(role: string): ContactInfo['category'] {
  const lowerRole = role.toLowerCase();

  if (
    lowerRole.includes('principal') ||
    lowerRole.includes('vice') ||
    lowerRole.includes('admin')
  ) {
    return 'administration';
  }
  if (
    lowerRole.includes('nurse') ||
    lowerRole.includes('health') ||
    lowerRole.includes('medical')
  ) {
    return 'medical';
  }
  if (lowerRole.includes('security') || lowerRole.includes('safety')) {
    return 'safety';
  }
  if (lowerRole.includes('it') || lowerRole.includes('tech') || lowerRole.includes('computer')) {
    return 'technical';
  }
  if (lowerRole.includes('bus') || lowerRole.includes('transport')) {
    return 'transportation';
  }
  if (
    lowerRole.includes('custodian') ||
    lowerRole.includes('maintenance') ||
    lowerRole.includes('secretary')
  ) {
    return 'support';
  }

  return 'support';
}

/**
 * Format a single contact for display
 */
function formatContact(contact: ContactInfo): string {
  let formatted = `${contact.role}: ${contact.name}`;

  if (contact.phone) {
    formatted += ` - ${contact.phone}`;
    if (contact.extension) {
      formatted += ` ext. ${contact.extension}`;
    }
  }

  if (contact.location) {
    formatted += ` (${contact.location})`;
  }

  if (contact.availability !== 'School hours') {
    formatted += ` [${contact.availability}]`;
  }

  return formatted;
}

/**
 * Get default school contacts that every school should have
 */
function getDefaultSchoolContacts(): ContactInfo[] {
  return [
    {
      id: 'office-main',
      name: 'School Office',
      role: 'Main Office',
      phone: 'Contact office for number',
      extension: '101',
      availability: 'School hours',
      priority: 'urgent',
      category: 'administration',
    },
    {
      id: 'principal',
      name: 'Principal',
      role: 'Principal',
      phone: 'Contact office for number',
      extension: '100',
      availability: 'School hours',
      priority: 'urgent',
      category: 'administration',
    },
    {
      id: 'vice-principal',
      name: 'Vice Principal',
      role: 'Vice Principal',
      phone: 'Contact office for number',
      extension: '102',
      availability: 'School hours',
      priority: 'urgent',
      category: 'administration',
    },
    {
      id: 'nurse',
      name: 'School Nurse',
      role: 'Nurse',
      phone: 'Contact office for number',
      extension: '105',
      availability: 'School hours',
      priority: 'urgent',
      category: 'medical',
    },
    {
      id: 'emergency',
      name: 'Emergency Services',
      role: 'Emergency (Fire/Police/Ambulance)',
      phone: '911',
      availability: '24/7',
      priority: 'emergency',
      category: 'safety',
    },
    {
      id: 'custodian',
      name: 'Custodial Staff',
      role: 'Custodian',
      phone: 'Contact office for number',
      extension: '110',
      availability: 'School hours',
      priority: 'normal',
      category: 'support',
    },
    {
      id: 'it-support',
      name: 'IT Support',
      role: 'Technology Support',
      phone: 'Contact office for number',
      extension: '150',
      availability: 'School hours',
      priority: 'normal',
      category: 'technical',
    },
  ];
}

/**
 * Generate contact card for emergency situations
 */
export function generateEmergencyContactCard(contacts: ExtractedContacts): string {
  const emergencyList = getEmergencyContactsList(contacts);

  return `
┌─────────────────────────────────────┐
│         EMERGENCY CONTACTS          │
├─────────────────────────────────────┤
│ ${emergencyList.split('\n').join('\n│ ')}
│                                     │
│ FOR IMMEDIATE EMERGENCIES CALL 911  │
└─────────────────────────────────────┘

Keep this card visible at all times during your substitute assignment.
  `.trim();
}
