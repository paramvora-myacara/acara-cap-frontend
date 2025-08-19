// src/app/api/project-qa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { streamObject } from 'ai';
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { AIContextRequest } from '@/types/ask-ai-types';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const MODEL_NAME = 'gemini-2.5-flash';

// Schema for AI response with markdown support
const ProjectQASchema = z.object({
  answer_markdown: z.string().describe('A comprehensive, helpful answer to the user\'s question about the form field, formatted in markdown')
});

export async function POST(req: NextRequest) {
  try {
    const { fieldContext, projectContext, question, chatHistory }: AIContextRequest = await req.json();
    
    if (!fieldContext || !projectContext) {
      return NextResponse.json({ error: 'Missing required context' }, { status: 400 });
    }

    // Build system prompt
    const systemPrompt = `You are a commercial real estate form completion expert assistant with 20+ years of experience.

CURRENT CONTEXT:
- Field: ${fieldContext.label} (${fieldContext.type})
- Section: ${fieldContext.section}
- Project: ${projectContext.projectName}
- Asset Type: ${projectContext.assetType}
- Project Phase: ${projectContext.projectPhase}
- Current Value: ${fieldContext.currentValue || 'Not filled'}
- Loan Amount: $${projectContext.loanAmountRequested?.toLocaleString() || 'Not specified'}
- Target LTV: ${projectContext.targetLtvPercent || 'Not specified'}%
- Location: ${projectContext.propertyAddressCity}, ${projectContext.propertyAddressState}

INSTRUCTIONS:
1. Answer questions specifically about this field and its context
2. Reference the current project details when relevant
3. Provide actionable advice for completing this field
4. Explain industry standards and best practices
5. Always consider the user's specific project type and phase
6. Use the chat history to provide contextual follow-up responses
7. Format your response using markdown for better readability

RESPONSE FORMAT:
- Use markdown formatting for structure (headers, lists, emphasis)
- Clear, concise explanations
- Bullet points for actionable items
- Specific examples relevant to their project
- References to related form sections
- Industry benchmarks when applicable
- Use **bold** for important points and *italic* for emphasis

Remember: You're helping someone complete a real commercial real estate project form. Be specific and practical.`;

    // Build user prompt
    const userPrompt = question 
      ? `User Question: ${question}`
      : `Please provide guidance on completing the "${fieldContext.label}" field for this project.`;

    // Add chat history context if available
    const historyContext = chatHistory && chatHistory.length > 0 
      ? `\n\nPrevious conversation:\n${chatHistory.slice(-3).map(msg => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n')}`
      : '';

    const result = await streamObject({
      model: google(MODEL_NAME),
      system: systemPrompt,
      schema: ProjectQASchema,
      prompt: `${userPrompt}${historyContext}`,
    });

    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error('project-qa error:', e);
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 });
  }
} 