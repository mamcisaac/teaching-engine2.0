/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 8: Daily aggregation of reflections
 * 
 * Discovering we need to compile reflections for daily review
 */

import { describe, it, expect } from 'vitest';

describe('Step 8: Daily reflection aggregation', () => {
  it('should get all reflections for a specific day', () => {
    // Discovering we need date-based filtering
    class ReflectionAggregator {
      private reflections: any[] = [];

      addReflection(reflection: any) {
        this.reflections.push({
          ...reflection,
          date: reflection.date || new Date().toISOString().split('T')[0]
        });
      }

      getDailyReflections(date: string) {
        return this.reflections.filter(r => r.date === date);
      }
    }

    const aggregator = new ReflectionAggregator();
    
    aggregator.addReflection({ 
      lessonId: 'math-1', 
      status: '👍', 
      date: '2024-01-15' 
    });
    aggregator.addReflection({ 
      lessonId: 'french-1', 
      status: '👌', 
      date: '2024-01-15' 
    });
    aggregator.addReflection({ 
      lessonId: 'science-1', 
      status: '👎', 
      date: '2024-01-16' 
    });

    const jan15Reflections = aggregator.getDailyReflections('2024-01-15');
    expect(jan15Reflections).toHaveLength(2);
    expect(jan15Reflections[0].lessonId).toBe('math-1');
    expect(jan15Reflections[1].lessonId).toBe('french-1');
  });

  it('should calculate daily success summary', () => {
    class ReflectionAggregator {
      private reflections: any[] = [];

      addReflection(reflection: any) {
        this.reflections.push({
          ...reflection,
          date: reflection.date || new Date().toISOString().split('T')[0]
        });
      }

      getDailySummary(date: string) {
        const dayReflections = this.reflections.filter(r => r.date === date);
        
        const summary = {
          total: dayReflections.length,
          successful: dayReflections.filter(r => r.status === '👍').length,
          mixed: dayReflections.filter(r => r.status === '👌').length,
          needsReteaching: dayReflections.filter(r => r.status === '👎').length
        };
        
        return summary;
      }
    }

    const aggregator = new ReflectionAggregator();
    
    aggregator.addReflection({ status: '👍', date: '2024-01-15' });
    aggregator.addReflection({ status: '👍', date: '2024-01-15' });
    aggregator.addReflection({ status: '👌', date: '2024-01-15' });
    aggregator.addReflection({ status: '👎', date: '2024-01-15' });

    const summary = aggregator.getDailySummary('2024-01-15');
    
    expect(summary.total).toBe(4);
    expect(summary.successful).toBe(2);
    expect(summary.mixed).toBe(1);
    expect(summary.needsReteaching).toBe(1);
  });

  it('should compile daily notes into single review', () => {
    class ReflectionAggregator {
      private reflections: any[] = [];

      addReflection(reflection: any) {
        this.reflections.push({
          ...reflection,
          date: reflection.date || new Date().toISOString().split('T')[0]
        });
      }

      getDailyNotes(date: string) {
        const dayReflections = this.reflections.filter(r => r.date === date && r.note);
        
        return dayReflections.map(r => ({
          lessonId: r.lessonId,
          subject: r.subject,
          status: r.status,
          note: r.note
        }));
      }
    }

    const aggregator = new ReflectionAggregator();
    
    aggregator.addReflection({ 
      lessonId: 'math-1',
      subject: 'Mathematics',
      status: '👎', 
      note: 'Need more manipulatives for counting',
      date: '2024-01-15' 
    });
    aggregator.addReflection({ 
      lessonId: 'french-1',
      subject: 'French',
      status: '👍', 
      note: 'Students loved the song!',
      date: '2024-01-15' 
    });

    const notes = aggregator.getDailyNotes('2024-01-15');
    
    expect(notes).toHaveLength(2);
    expect(notes[0].note).toContain('manipulatives');
    expect(notes[1].note).toContain('song');
  });
});