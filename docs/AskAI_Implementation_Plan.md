# Ask AI Feature - Comprehensive Implementation Plan

## Overview
Add an "Ask AI" card to the Project Resume form that allows users to drag and drop individual form fields to get contextual, intelligent assistance. The AI will provide field-specific help, answer questions, and guide users through form completion with full project context awareness.

## Core Features
- **Field-Level Drag & Drop**: Users can drag any form field into the Ask AI card
- **Context-Aware AI**: AI receives complete project state and field context
- **Session Persistence**: Chat history persists across the session
- **Multi-Turn Conversations**: Support for follow-up questions and clarifications
- **Preset Questions**: Intelligent question suggestions based on field type and context
- **Real-Time Updates**: AI context stays current with form changes

## Technical Architecture

### 1. Drag & Drop Implementation
**Technology Choice**: React DnD (react-beautiful-dnd)
**Rationale**: Built-in touch support, accessibility, visual feedback, React integration

```typescript
// Install dependencies
npm install react-beautiful-dnd @types/react-beautiful-dnd

// Implementation in EnhancedProjectForm
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Make form fields draggable
<Draggable draggableId={fieldId} index={index}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`field-container ${snapshot.isDragging ? 'dragging' : ''}`}
    >
      {/* Existing form field */}
    </div>
  )}
</Draggable>
```

### 2. Field Identification & Context Mapping
**Approach**: Data attributes + dynamic discovery
**Benefits**: Self-documenting, maintainable, flexible

```typescript
// Add data attributes to all form fields
<Input 
  id="projectName"
  data-field-id="projectName"
  data-field-type="input"
  data-field-section="basic-info"
  data-field-required="true"
  data-field-label="Project Name"
  data-field-placeholder="e.g., Riverfront Acquisition"
  // ... existing props
/>

<ButtonSelect
  label="Asset Type"
  data-field-id="assetType"
  data-field-type="button-select"
  data-field-section="basic-info"
  data-field-required="true"
  data-field-options={JSON.stringify(assetTypeOptions)}
  // ... existing props
/>

// Context building function
const buildFieldContext = (fieldId: string, formData: ProjectProfile) => {
  const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (!fieldElement) return null;

  return {
    id: fieldId,
    type: fieldElement.getAttribute('data-field-type'),
    section: fieldElement.getAttribute('data-field-section'),
    required: fieldElement.getAttribute('data-field-required') === 'true',
    label: fieldElement.getAttribute('data-field-label'),
    placeholder: fieldElement.getAttribute('data-field-placeholder'),
    currentValue: formData[fieldId as keyof ProjectProfile],
    options: fieldElement.getAttribute('data-field-options') 
      ? JSON.parse(fieldElement.getAttribute('data-field-options') || '[]')
      : undefined,
    validationState: getFieldValidationState(fieldId, formData)
  };
};
```

### 3. Real-Time Context Updates
**Pattern**: React Context + Event Subscription
**Benefits**: Real-time updates, efficient, reactive

```typescript
// Create FormContext for broadcasting changes
const FormContext = createContext<{
  formData: ProjectProfile;
  fieldChanged: (fieldId: string, value: any) => void;
  subscribeToChanges: (callback: (fieldId: string, value: any) => void) => () => void;
}>({});

// In EnhancedProjectForm, broadcast changes
const handleInputChange = (field: keyof ProjectProfile, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  setProjectChanges(true);
  
  // Broadcast to subscribers (Ask AI card)
  formContext.fieldChanged(field, value);
};

// In AskAICard, subscribe to changes
useEffect(() => {
  const unsubscribe = formContext.subscribeToChanges((fieldId, value) => {
    updateFieldContext(fieldId, value);
  });
  
  return unsubscribe;
}, []);
```

### 4. Multi-Project Chat Isolation
**Strategy**: Project-scoped storage + context switching
**Benefits**: Clean separation, context preservation, security

```typescript
// Project-specific storage keys
const getStorageKeys = (projectId: string) => ({
  chatHistory: `project-ai-chat-${projectId}`,
  fieldContext: `project-ai-context-${projectId}`,
  lastActive: `project-ai-last-active-${projectId}`
});

// Clear context when switching projects
useEffect(() => {
  if (activeProject?.id !== previousProjectId) {
    clearProjectContext(previousProjectId);
    loadProjectContext(activeProject?.id);
    setPreviousProjectId(activeProject?.id);
  }
}, [activeProject?.id]);

const clearProjectContext = (projectId: string) => {
  if (!projectId) return;
  
  const keys = getStorageKeys(projectId);
  sessionStorage.removeItem(keys.chatHistory);
  sessionStorage.removeItem(keys.fieldContext);
  sessionStorage.removeItem(keys.lastActive);
  
  setContextCache(new Map());
  setMessages([]);
};
```

### 5. AI Response Quality & Consistency
**Approach**: Structured system prompts + response validation
**Benefits**: Specific, actionable, context-aware responses

```typescript
// Enhanced system prompt for project form context
const getSystemPrompt = (fieldContext: FieldContext, projectContext: ProjectContext) => `
You are a commercial real estate form completion expert assistant.

CURRENT CONTEXT:
- Field: ${fieldContext.label} (${fieldContext.type})
- Section: ${fieldContext.section}
- Project: ${projectContext.projectName}
- Asset Type: ${projectContext.assetType}
- Project Phase: ${projectContext.projectPhase}
- Current Value: ${fieldContext.currentValue || 'Not filled'}

INSTRUCTIONS:
1. Answer questions specifically about this field and its context
2. Reference the current project details when relevant
3. Provide actionable advice for completing this field
4. Suggest related fields that might need attention
5. Explain industry standards and best practices
6. Always consider the user's specific project type and phase

RESPONSE FORMAT:
- Clear, concise explanations
- Bullet points for actionable items
- Specific examples relevant to their project
- References to related form sections
- Industry benchmarks when applicable

Remember: You're helping someone complete a real commercial real estate project form. Be specific and practical.
`;

// Response validation
const validateResponse = (response: string, formData: ProjectProfile) => {
  const fieldReferences = extractFieldReferences(response);
  const validFields = Object.keys(formData);
  
  const invalidReferences = fieldReferences.filter(
    ref => !validFields.includes(ref)
  );
  
  if (invalidReferences.length > 0) {
    console.warn('AI referenced non-existent fields:', invalidReferences);
  }
  
  return response;
};
```

### 6. Performance & User Experience
**Strategy**: Optimistic UI + background processing
**Benefits**: Immediate feedback, better perceived performance

```typescript
// Immediate feedback when field is dropped
const handleFieldDrop = (fieldId: string) => {
  // 1. Immediate visual feedback (optimistic)
  setDroppedField(fieldId);
  setShowDropSuccess(true);
  
  // 2. Start context building in background
  const buildContextAsync = async () => {
    setIsBuildingContext(true);
    
    try {
      const context = await buildFieldContextAsync(fieldId);
      setFieldContext(context);
      
      // 3. Pre-generate preset questions
      const questions = generatePresetQuestions(context);
      setPresetQuestions(questions);
      
    } catch (error) {
      setContextError(error);
    } finally {
      setIsBuildingContext(false);
    }
  };
  
  buildContextAsync();
};

// Context building optimization with memoization
const buildFieldContext = useMemo(() => {
  return (fieldId: string) => {
    if (contextCache.has(fieldId)) {
      return contextCache.get(fieldId);
    }
    
    const context = buildFieldContextFromScratch(fieldId);
    setContextCache(prev => new Map(prev).set(fieldId, context));
    
    return context;
  };
}, [contextCache]);
```

### 7. Error Handling & Edge Cases
**Approach**: Graceful degradation + user guidance
**Benefits**: Better user experience, clear recovery paths

```typescript
// Handle various error states
const handleFieldDrop = (fieldId: string) => {
  try {
    // Validate field exists
    if (!isValidField(fieldId)) {
      throw new Error(`Field "${fieldId}" not found`);
    }
    
    // Check if field is accessible
    if (!isFieldAccessible(fieldId, formData)) {
      throw new Error(`Field "${fieldId}" is not accessible in current form state`);
    }
    
    // Proceed with normal flow
    processFieldDrop(fieldId);
    
  } catch (error) {
    // Show user-friendly error message
    showFieldDropError(error.message);
    
    // Suggest alternatives
    suggestAlternativeFields(fieldId);
  }
};

// Handle form validation states
const getFieldValidationState = (fieldId: string, formData: ProjectProfile) => {
  const field = getFieldDefinition(fieldId);
  const value = formData[fieldId as keyof ProjectProfile];
  
  return {
    isValid: validateField(field, value),
    errors: getFieldErrors(field, value),
    warnings: getFieldWarnings(field, value),
    isComplete: isFieldComplete(field, value),
    suggestions: getFieldSuggestions(field, value, formData)
  };
};

// Handle AI service failures
const handleAIServiceFailure = (error: Error) => {
  if (error.message.includes('rate limit')) {
    showRateLimitMessage();
    queueRequestForRetry();
  } else if (error.message.includes('timeout')) {
    showTimeoutMessage();
    offerRetry();
  } else {
    showGenericErrorMessage();
    showStaticHelpContent();
  }
};
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
1. Install React DnD dependencies
2. Create FormContext for real-time updates
3. Add data attributes to all form fields
4. Implement basic drag & drop functionality
5. Create AskAICard component structure

### Phase 2: Context Building & AI Integration (Week 3-4)
1. Implement field context building system
2. Create context caching mechanism
3. Refactor existing OM API route for project form context
4. Implement AI response generation
5. Add response validation

### Phase 3: Chat Interface & Persistence (Week 5-6)
1. Implement chat message system
2. Add session storage for chat history
3. Create preset question generation
4. Implement multi-turn conversation support
5. Add markdown rendering for responses

### Phase 4: User Experience & Polish (Week 7-8)
1. Add visual feedback and animations
2. Implement error handling and recovery
3. Add accessibility features
4. Performance optimization
5. Testing and bug fixes

## File Structure

```
src/
├── components/
│   ├── forms/
│   │   └── EnhancedProjectForm.tsx (add drag & drop)
│   ├── project/
│   │   ├── ProjectWorkspace.tsx (add AskAICard)
│   │   └── AskAICard.tsx (new component)
│   └── ui/
│       └── DragDropProvider.tsx (new wrapper)
├── contexts/
│   └── FormContext.tsx (new context)
├── hooks/
│   └── useAskAI.ts (new hook)
├── services/
│   └── aiContextBuilder.ts (new service)
└── app/
    └── api/
        └── project-qa/route.ts (new API route)
```

## Key Components

### AskAICard Component
```typescript
interface AskAICardProps {
  projectId: string;
  formData: ProjectProfile;
}

export const AskAICard: React.FC<AskAICardProps> = ({ projectId, formData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(null);
  const [presetQuestions, setPresetQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat functionality
  const [question, setQuestion] = useState('');
  const [isBuildingContext, setIsBuildingContext] = useState(false);
  
  // Context management
  const [contextCache, setContextCache] = useState<Map<string, FieldContext>>(new Map());
  
  // ... implementation
};
```

### FormContext
```typescript
interface FormContextType {
  formData: ProjectProfile;
  fieldChanged: (fieldId: string, value: any) => void;
  subscribeToChanges: (callback: (fieldId: string, value: any) => void) => () => void;
  getFieldContext: (fieldId: string) => FieldContext | null;
}

export const FormContext = createContext<FormContextType>({} as FormContextType);
```

### AI Context Builder Service
```typescript
export class AIContextBuilder {
  static buildFieldContext(fieldId: string, formData: ProjectProfile): FieldContext {
    // Implementation
  }
  
  static buildProjectContext(formData: ProjectProfile): ProjectContext {
    // Implementation
  }
  
  static generatePresetQuestions(fieldContext: FieldContext): string[] {
    // Implementation
  }
}
```

## Preset Questions by Field Type

### Basic Info Fields
- **Project Name**: "How should I name my project for maximum clarity?"
- **Asset Type**: "What is [Asset Type] and what are the key considerations?"
- **Project Phase**: "What does [Project Phase] mean and how does it affect my loan?"

### Loan Info Fields
- **Recourse Preference**: "What is [Recourse Type] and how does it affect my loan?"
- **Target LTV**: "How do I calculate the right LTV percentage for my project?"
- **Interest Rate Type**: "What's the difference between Fixed and Floating rates?"

### Financial Fields
- **Exit Strategy**: "How do I choose the right exit strategy for my project?"
- **CapEx Budget**: "What should I include in my CapEx budget?"
- **Projected NOI**: "How do I estimate my future NOI?"

## Success Metrics

1. **User Engagement**: Percentage of users who use Ask AI feature
2. **Field Completion**: Improvement in form completion rates
3. **User Satisfaction**: Feedback scores on AI responses
4. **Performance**: Response time for AI assistance
5. **Error Reduction**: Decrease in form validation errors

## Future Enhancements

1. **Multi-Language Support**: AI responses in user's preferred language
2. **Voice Integration**: Allow users to ask questions verbally
3. **Advanced Analytics**: Track which fields users struggle with most
4. **Integration with External Systems**: Pull real-time market data
5. **Mobile Optimization**: Touch-friendly alternatives to drag & drop

## Conclusion

This implementation plan provides a comprehensive roadmap for building the Ask AI feature. The approach prioritizes user experience, performance, and maintainability while leveraging proven technologies and patterns. The phased implementation allows for iterative development and testing, ensuring a high-quality final product. 