# Phase 3 Enhancement Integration Examples

## Overview

This document demonstrates how to integrate the A3 (Reflection Classifier) and A4 (Prompt Generator) components into existing Teaching Engine 2.0 workflows.

## A3: Reflection Classifier Integration

### 1. Integration with OutcomeReflectionsJournal

Add the ReflectionClassifier as a modal or tab within the existing reflection workflow:

```tsx
import { ReflectionClassifier } from '../assessment';

// In OutcomeReflectionsJournal.tsx, add state for showing the classifier
const [showClassifier, setShowClassifier] = useState(false);

// Add a button to open the classifier
<Button onClick={() => setShowClassifier(true)} variant="outline" size="sm">
  <Brain className="h-4 w-4 mr-2" />
  {language === 'fr' ? 'Classifier Réflexion' : 'Classify Reflection'}
</Button>;

// Add the classifier modal
{
  showClassifier && (
    <Modal onClose={() => setShowClassifier(false)}>
      <ReflectionClassifier
        selectedOutcomeId={activeOutcomeId}
        onClassificationComplete={(result) => {
          // Handle the classification result
          console.log('Classification complete:', result);
          // Optionally refresh reflections list
          queryClient.invalidateQueries(['teacher-reflections']);
        }}
        onAddToPortfolio={(studentId, text, classification) => {
          // Add to student portfolio
          console.log('Adding to portfolio:', { studentId, text, classification });
          setShowClassifier(false);
        }}
      />
    </Modal>
  );
}
```

### 2. Integration with Student Dashboard

Show classified reflections with AI-suggested outcomes:

```tsx
import { ClassificationStats, useClassificationStats } from '../../api';

const StudentReflectionCard = ({ reflection }) => {
  const suggestedOutcomes = reflection.suggestedOutcomeIds
    ? JSON.parse(reflection.suggestedOutcomeIds)
    : [];
  const selTags = reflection.selTags ? JSON.parse(reflection.selTags) : [];

  return (
    <Card>
      <CardContent>
        <p>{reflection.content}</p>

        {/* Show AI Classifications */}
        {suggestedOutcomes.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700">AI-Suggested Outcomes</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {suggestedOutcomes.map((outcomeId) => (
                <Badge key={outcomeId} variant="outline">
                  {outcomeId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Show SEL Tags */}
        {selTags.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700">SEL Competencies</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {selTags.map((tag) => (
                <Badge key={tag} className="bg-green-100 text-green-800">
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

## A4: Prompt Generator Integration

### 1. Integration with WeeklyPlannerPage

Add the PromptGeneratorPanel as a sidebar or expandable section:

```tsx
import { PromptGeneratorPanel } from '../planning';

// In WeeklyPlannerPage.tsx
const [showPromptGenerator, setShowPromptGenerator] = useState(false);
const [selectedActivity, setSelectedActivity] = useState(null);

// Add toggle button
<Button onClick={() => setShowPromptGenerator(!showPromptGenerator)} variant="outline" size="sm">
  <Lightbulb className="h-4 w-4 mr-2" />
  {language === 'fr' ? "Générateur d'Invites" : 'Prompt Generator'}
</Button>;

// Add the panel in a collapsible section
{
  showPromptGenerator && (
    <div className="border-t pt-4 mt-4">
      <PromptGeneratorPanel
        onPromptInsert={(prompt, outcomeId) => {
          // Insert prompt into the currently selected activity
          if (selectedActivity) {
            const updatedActivity = {
              ...selectedActivity,
              notes: (selectedActivity.notes || '') + '\\n\\n' + prompt,
            };
            // Update the activity through your update mechanism
            updateActivity(updatedActivity);
          }
        }}
        onPromptCopy={(prompt) => {
          // Prompt is already copied to clipboard by the component
          toast.success('Prompt copied for use in lesson plans');
        }}
      />
    </div>
  );
}
```

### 2. Integration with Activity Builder

Add quick prompt insertion to activity creation workflow:

```tsx
const ActivityEditor = ({ activity, onUpdate }) => {
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);

  const insertPromptIntoDescription = (prompt) => {
    const currentDescription = activity.description || '';
    const newDescription = currentDescription + '\\n\\n🎯 ' + prompt;
    onUpdate({ ...activity, description: newDescription });
  };

  return (
    <div>
      {/* Existing activity editor fields */}

      {/* Quick Prompts Section */}
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowQuickPrompts(!showQuickPrompts)}
        >
          Add Pedagogical Prompts
        </Button>

        {showQuickPrompts && (
          <div className="mt-2 p-3 border rounded-lg">
            <PromptGeneratorPanel
              selectedOutcomeId={activity.outcomeId}
              onPromptInsert={insertPromptIntoDescription}
              onOutcomeSelect={(outcomeId) => {
                // Optionally update the activity's outcome
                onUpdate({ ...activity, outcomeId });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

## Analytics Integration

### Classification Analytics Dashboard

```tsx
import { useClassificationStats } from '../../api';

const ReflectionAnalyticsDashboard = () => {
  const { data: stats } = useClassificationStats();

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Classified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalClassified}</div>
          <p className="text-sm text-gray-600">
            Average confidence: {(stats.averageConfidence * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top SEL Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topSELTags.slice(0, 5).map(({ tag, count }) => (
              <div key={tag} className="flex justify-between">
                <span className="capitalize">{tag.replace('-', ' ')}</span>
                <Badge>{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.recentClassifications}</div>
          <p className="text-sm text-gray-600">Classifications in last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

## API Usage Examples

### Batch Classification

```tsx
const classifyMultipleReflections = async (reflections) => {
  const classifyMutation = useClassifyReflection();

  for (const reflection of reflections) {
    if (reflection.content && !reflection.classifiedAt) {
      try {
        const result = await classifyMutation.mutateAsync({
          studentId: reflection.studentId,
          text: reflection.content,
        });

        // Update the reflection with classification results
        await updateStudentReflection(reflection.id, {
          suggestedOutcomeIds: JSON.stringify(result.outcomes.map((o) => o.id)),
          selTags: JSON.stringify(result.selTags),
          classificationConfidence: result.outcomes[0]?.confidence || 0,
          classificationRationale: result.outcomes[0]?.rationale || '',
          classifiedAt: new Date(),
        });
      } catch (error) {
        console.error('Failed to classify reflection:', reflection.id, error);
      }
    }
  }
};
```

### Prompt Caching Strategy

```tsx
const useOutcomePromptsWithFallback = (outcomeId, language) => {
  const { data: cachedPrompts } = useOutcomePrompts(outcomeId, language);
  const generateMutation = useGeneratePrompts();

  const getPrompts = useCallback(async () => {
    if (cachedPrompts?.prompts?.length > 0) {
      return cachedPrompts.prompts;
    }

    // Generate new prompts if none cached
    const result = await generateMutation.mutateAsync({
      outcomeId,
      language,
    });

    return result.prompts;
  }, [cachedPrompts, outcomeId, language, generateMutation]);

  return { getPrompts, isLoading: generateMutation.isPending };
};
```

## Best Practices

### 1. User Experience

- Always provide feedback when classification or generation is in progress
- Allow users to accept/reject AI suggestions
- Cache generated prompts to avoid regenerating the same content
- Provide confidence scores to help users make decisions

### 2. Performance

- Use the cached prompts when available
- Batch classification requests when possible
- Implement proper loading states and error handling
- Consider implementing background classification for new reflections

### 3. Privacy & Security

- Ensure all classification data stays within the user's scope
- Log classification accuracy for continuous improvement
- Allow users to delete or modify AI-generated suggestions
- Respect user preferences for AI assistance levels

## Testing Integration

```tsx
// Example test for integrated component
describe('WeeklyPlanner with PromptGenerator Integration', () => {
  it('should insert generated prompt into activity description', async () => {
    render(<WeeklyPlannerWithPrompts />);

    // Open prompt generator
    fireEvent.click(screen.getByText('Prompt Generator'));

    // Select an outcome
    fireEvent.click(screen.getByText('CO.1: Count to 10'));

    // Generate prompts
    fireEvent.click(screen.getByText('Generate Prompts'));

    await waitFor(() => {
      expect(screen.getByText('How do you know your answer is correct?')).toBeInTheDocument();
    });

    // Insert prompt
    fireEvent.click(screen.getByLabelText('Insert prompt'));

    // Verify prompt was added to activity
    expect(mockUpdateActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('How do you know your answer is correct?'),
      }),
    );
  });
});
```

This integration approach ensures that the Phase 3 Enhancement features seamlessly blend into existing workflows while providing substantial value to teachers through AI-powered assistance.
