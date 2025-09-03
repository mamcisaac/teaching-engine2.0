/**
 * Simple Backup System for Teacher Data
 * No backend needed - just download/upload JSON files
 */

export class TeacherBackupSystem {
  /**
   * Export all assessment data to a JSON file
   */
  exportAllData(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const schoolYear = this.getCurrentSchoolYear();
    
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      schoolYear,
      teacher: localStorage.getItem('teacher-name') || 'Emily',
      assessments: this.getAllAssessments(),
      groups: this.getAllGroups(),
      students: this.getStudentRoster(),
      statistics: this.generateStatistics()
    };

    this.downloadJSON(data, `assessments-backup-${timestamp}.json`);
  }

  /**
   * Export data for the current school year only
   */
  exportSchoolYear(): void {
    const schoolYear = this.getCurrentSchoolYear();
    const startDate = new Date(parseInt(schoolYear), 8, 1); // Sept 1
    const endDate = new Date(parseInt(schoolYear) + 1, 6, 30); // June 30
    
    const data = {
      version: '1.0',
      schoolYear,
      exportDate: new Date().toISOString(),
      assessments: this.getAssessmentsBetween(startDate, endDate),
      groups: this.getGroupsBetween(startDate, endDate),
      summary: this.generateYearEndSummary()
    };

    this.downloadJSON(data, `school-year-${schoolYear}-${parseInt(schoolYear) + 1}.json`);
  }

  /**
   * Perform an auto-backup to localStorage
   * This doesn't download a file, just saves a backup point locally
   */
  performAutoBackup(): void {
    const timestamp = new Date().toISOString();
    const backupKey = 'auto-backup-latest';
    const historyKey = 'auto-backup-history';
    
    const data = {
      version: '1.0',
      timestamp,
      assessments: this.getAllAssessments(),
      groups: this.getAllGroups(),
      students: this.getStudentRoster()
    };
    
    // Save the latest backup
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // Keep a rolling history of last 5 backups
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift({ timestamp, size: JSON.stringify(data).length });
    
    // Keep only last 5 backups
    if (history.length > 5) {
      history.pop();
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  /**
   * Import data from a backup file
   */
  async importData(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the backup file
      if (!data.version || !data.assessments) {
        return { success: false, message: 'Invalid backup file format' };
      }

      // Ask for confirmation if data exists
      const existingAssessments = this.getAllAssessments();
      if (existingAssessments.length > 0) {
        const confirm = window.confirm(
          `You have ${existingAssessments.length} existing assessments. ` +
          `Do you want to merge the imported data (OK) or replace everything (Cancel to abort)?`
        );
        
        if (confirm) {
          // Merge mode
          this.mergeData(data);
          return { success: true, message: `Merged ${data.assessments.length} assessments` };
        } else {
          return { success: false, message: 'Import cancelled' };
        }
      }

      // Import the data
      this.restoreData(data);
      return { 
        success: true, 
        message: `Imported ${data.assessments.length} assessments and ${data.groups?.length || 0} groups` 
      };

    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, message: 'Failed to read backup file' };
    }
  }

  /**
   * Archive old school year and start fresh
   */
  archiveAndStartNewYear(): void {
    // First, export the current year
    this.exportSchoolYear();
    
    // Archive old data with prefix
    const schoolYear = this.getCurrentSchoolYear();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('assessment-') || key.startsWith('groups-')) {
        const value = localStorage.getItem(key);
        if (value) {
          // Archive with year prefix
          localStorage.setItem(`archive-${schoolYear}-${key}`, value);
          // Remove current
          localStorage.removeItem(key);
        }
      }
    });

    // Set new school year
    const newYear = parseInt(schoolYear) + 1;
    localStorage.setItem('current-school-year', newYear.toString());
    
    alert(`School year ${schoolYear}-${parseInt(schoolYear) + 1} archived. Starting fresh for ${newYear}-${newYear + 1}!`);
  }

  /**
   * Generate parent-friendly progress report
   */
  generateParentReport(studentId: string, studentName: string): void {
    const assessments = this.getStudentAssessments(studentId);
    const lastMonth = assessments.slice(-20); // Last ~20 assessments
    
    // Calculate progress
    const levels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
    const levelCounts = { NOT_YET: 0, APPROACHING: 0, MEETING: 0, EXCEEDING: 0 };
    
    lastMonth.forEach(a => {
      levelCounts[a.level as keyof typeof levelCounts]++;
    });

    const report = {
      student: studentName,
      period: `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      assessmentCount: lastMonth.length,
      performance: levelCounts,
      trend: this.calculateTrend(assessments),
      strengths: this.identifyStrengths(assessments),
      areasForGrowth: this.identifyGrowthAreas(assessments),
      teacherNotes: localStorage.getItem(`notes-${studentId}`) || ''
    };

    // Generate simple HTML report
    const html = this.generateReportHTML(report);
    this.downloadHTML(html, `${studentName.replace(/\s+/g, '-')}-progress-report.html`);
  }

  /**
   * Export CSV for report cards
   */
  exportReportCardData(): void {
    const students = this.getStudentRoster();
    const csv = ['Student,Assessments,Not Yet,Approaching,Meeting,Exceeding,Overall'];
    
    students.forEach(student => {
      const assessments = this.getStudentAssessments(student.id);
      const counts = this.countLevels(assessments);
      const overall = this.calculateOverallLevel(counts);
      
      csv.push([
        `"${student.firstName} ${student.lastName}"`,
        assessments.length,
        counts.NOT_YET,
        counts.APPROACHING,
        counts.MEETING,
        counts.EXCEEDING,
        overall
      ].join(','));
    });

    this.downloadCSV(csv.join('\n'), `report-card-data-${this.getCurrentSchoolYear()}.csv`);
  }

  // Helper methods
  private getAllAssessments(): any[] {
    const assessments = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('assessment-') && !key.includes('sync') && !key.includes('groups')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.lessonId) {
            assessments.push(data);
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    });
    
    return assessments;
  }

  private getAllGroups(): any[] {
    const groups = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('assessment-groups-') || key === 'tomorrow-groups') {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.forDate) {
            groups.push(data);
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    });
    
    return groups;
  }

  private getStudentRoster(): any[] {
    // Get unique students from all assessments
    const studentsMap = new Map();
    const assessments = this.getAllAssessments();
    
    // Default roster for Emily's class
    const defaultRoster = [
      { id: '1', firstName: 'Emma', lastName: 'Smith' },
      { id: '2', firstName: 'Liam', lastName: 'Johnson' },
      { id: '3', firstName: 'Olivia', lastName: 'Williams' },
      { id: '4', firstName: 'Noah', lastName: 'Brown' },
      { id: '5', firstName: 'Ava', lastName: 'Jones' },
      { id: '6', firstName: 'Sophia', lastName: 'Garcia' },
      { id: '7', firstName: 'Mason', lastName: 'Miller' },
      { id: '8', firstName: 'Isabella', lastName: 'Davis' }
    ];

    defaultRoster.forEach(s => studentsMap.set(s.id, s));
    
    return Array.from(studentsMap.values());
  }

  private getStudentAssessments(studentId: string): any[] {
    const assessments = this.getAllAssessments();
    const studentAssessments: any[] = [];
    
    assessments.forEach(a => {
      if (a.assessments) {
        const studentData = a.assessments.find(([id]: [string, string]) => id === studentId);
        if (studentData) {
          studentAssessments.push({
            date: a.timestamp,
            lessonId: a.lessonId,
            level: studentData[1],
            expectation: a.expectation
          });
        }
      }
    });
    
    return studentAssessments.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private getCurrentSchoolYear(): string {
    const stored = localStorage.getItem('current-school-year');
    if (stored) return stored;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // School year starts in September
    return month >= 8 ? year.toString() : (year - 1).toString();
  }

  private getAssessmentsBetween(start: Date, end: Date): any[] {
    return this.getAllAssessments().filter(a => {
      const date = new Date(a.timestamp);
      return date >= start && date <= end;
    });
  }

  private getGroupsBetween(start: Date, end: Date): any[] {
    return this.getAllGroups().filter(g => {
      const date = new Date(g.forDate);
      return date >= start && date <= end;
    });
  }

  private generateStatistics(): any {
    const assessments = this.getAllAssessments();
    const totalStudents = this.getStudentRoster().length;
    
    return {
      totalAssessments: assessments.length,
      totalStudents,
      averagePerDay: (assessments.length / 180).toFixed(1), // Assuming 180 school days
      mostCommonLevel: this.getMostCommonLevel(assessments)
    };
  }

  private generateYearEndSummary(): any {
    const students = this.getStudentRoster();
    const summary: any = {
      students: students.length,
      assessments: 0,
      byStudent: {}
    };

    students.forEach(student => {
      const assessments = this.getStudentAssessments(student.id);
      const counts = this.countLevels(assessments);
      
      summary.byStudent[student.id] = {
        name: `${student.firstName} ${student.lastName}`,
        totalAssessments: assessments.length,
        finalLevel: this.calculateOverallLevel(counts),
        trend: this.calculateTrend(assessments)
      };
      
      summary.assessments += assessments.length;
    });

    return summary;
  }

  private countLevels(assessments: any[]): any {
    const counts = { NOT_YET: 0, APPROACHING: 0, MEETING: 0, EXCEEDING: 0 };
    assessments.forEach(a => {
      counts[a.level as keyof typeof counts]++;
    });
    return counts;
  }

  private calculateOverallLevel(counts: any): string {
    const total = Object.values(counts).reduce((sum: any, c: any) => sum + c, 0) as number;
    if (total === 0) return 'MEETING';
    
    // Weighted average
    const score = (
      counts.NOT_YET * 1 +
      counts.APPROACHING * 2 +
      counts.MEETING * 3 +
      counts.EXCEEDING * 4
    ) / total;
    
    if (score < 1.5) return 'NOT_YET';
    if (score < 2.5) return 'APPROACHING';
    if (score < 3.5) return 'MEETING';
    return 'EXCEEDING';
  }

  private calculateTrend(assessments: any[]): string {
    if (assessments.length < 2) return 'stable';
    
    const recent = assessments.slice(-5);
    const older = assessments.slice(-10, -5);
    
    const recentAvg = this.averageLevel(recent);
    const olderAvg = this.averageLevel(older);
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  }

  private averageLevel(assessments: any[]): number {
    if (assessments.length === 0) return 2.5;
    
    const values: any = { NOT_YET: 1, APPROACHING: 2, MEETING: 3, EXCEEDING: 4 };
    const sum = assessments.reduce((total, a) => total + (values[a.level] || 2.5), 0);
    
    return sum / assessments.length;
  }

  private getMostCommonLevel(assessments: any[]): string {
    const allLevels: string[] = [];
    
    assessments.forEach(a => {
      if (a.assessments) {
        a.assessments.forEach(([_, level]: [string, string]) => {
          allLevels.push(level);
        });
      }
    });

    const counts: any = {};
    allLevels.forEach(level => {
      counts[level] = (counts[level] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'MEETING';
  }

  private identifyStrengths(assessments: any[]): string[] {
    // Simple heuristic for parent reports
    const recent = assessments.slice(-10);
    const exceeding = recent.filter(a => a.level === 'EXCEEDING').length;
    const meeting = recent.filter(a => a.level === 'MEETING').length;
    
    const strengths = [];
    if (exceeding >= 3) strengths.push('Consistently exceeding expectations');
    if (meeting >= 5) strengths.push('Solid understanding of concepts');
    if (this.calculateTrend(assessments) === 'improving') strengths.push('Showing steady improvement');
    
    return strengths.length > 0 ? strengths : ['Working hard to master new concepts'];
  }

  private identifyGrowthAreas(assessments: any[]): string[] {
    const recent = assessments.slice(-10);
    const notYet = recent.filter(a => a.level === 'NOT_YET').length;
    const approaching = recent.filter(a => a.level === 'APPROACHING').length;
    
    const areas = [];
    if (notYet >= 3) areas.push('Needs additional support with foundational concepts');
    if (approaching >= 5) areas.push('Continue practicing to build confidence');
    
    return areas.length > 0 ? areas : ['Continue current learning path'];
  }

  private mergeData(importedData: any): void {
    // Merge assessments
    if (importedData.assessments) {
      importedData.assessments.forEach((assessment: any) => {
        const key = `assessment-${assessment.lessonId}`;
        // Only add if doesn't exist
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(assessment));
        }
      });
    }

    // Merge groups
    if (importedData.groups) {
      importedData.groups.forEach((group: any) => {
        const key = `assessment-groups-${group.forDate}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(group));
        }
      });
    }
  }

  private restoreData(data: any): void {
    // Clear existing assessment data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('assessment-') || key.startsWith('groups-')) {
        localStorage.removeItem(key);
      }
    });

    // Restore assessments
    if (data.assessments) {
      data.assessments.forEach((assessment: any) => {
        localStorage.setItem(`assessment-${assessment.lessonId}`, JSON.stringify(assessment));
      });
    }

    // Restore groups
    if (data.groups) {
      data.groups.forEach((group: any) => {
        localStorage.setItem(`assessment-groups-${group.forDate}`, JSON.stringify(group));
      });
    }
  }

  private generateReportHTML(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.student} - Progress Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    .section { margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
    .performance { display: flex; gap: 20px; }
    .level { padding: 10px; border-radius: 4px; text-align: center; }
    .not-yet { background: #fee2e2; }
    .approaching { background: #fed7aa; }
    .meeting { background: #bbf7d0; }
    .exceeding { background: #bfdbfe; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${report.student} - Progress Report</h1>
  <p><strong>Period:</strong> ${report.period}</p>
  <p><strong>Total Assessments:</strong> ${report.assessmentCount}</p>
  
  <div class="section">
    <h2>Performance Distribution</h2>
    <div class="performance">
      <div class="level not-yet">Not Yet<br>${report.performance.NOT_YET}</div>
      <div class="level approaching">Approaching<br>${report.performance.APPROACHING}</div>
      <div class="level meeting">Meeting<br>${report.performance.MEETING}</div>
      <div class="level exceeding">Exceeding<br>${report.performance.EXCEEDING}</div>
    </div>
  </div>
  
  <div class="section">
    <h2>Trend: ${report.trend}</h2>
    <h3>Strengths:</h3>
    <ul>${report.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
    <h3>Areas for Growth:</h3>
    <ul>${report.areasForGrowth.map((a: string) => `<li>${a}</li>`).join('')}</ul>
  </div>
  
  ${report.teacherNotes ? `
  <div class="section">
    <h2>Teacher Notes</h2>
    <p>${report.teacherNotes}</p>
  </div>
  ` : ''}
  
  <p style="margin-top: 40px; color: #666; font-size: 12px;">
    Generated on ${new Date().toLocaleDateString()}
  </p>
</body>
</html>`;
  }

  private downloadJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.download(blob, filename);
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    this.download(blob, filename);
  }

  private downloadHTML(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html' });
    this.download(blob, filename);
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const backupSystem = new TeacherBackupSystem();