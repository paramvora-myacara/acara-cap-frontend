# Talk to OM - Setup Guide

## Prerequisites

The "Talk to OM" functionality has been successfully implemented and requires the following setup:

## 1. Environment Variables

Create a `.env.local` file in your project root with your Gemini API key:

```bash
GEMINI_API_KEY=YOUR_API_KEY_FROM_AI_STUDIO
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "Get API key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy the API key and paste it in your `.env.local` file

## 2. Dependencies

The following packages have been installed:
- `@google/genai` - Google's Generative AI SDK
- `react-markdown` - Markdown rendering for responses
- `remark-gfm` - GitHub Flavored Markdown support

## 3. Features Implemented

### API Route
- **Endpoint**: `POST /api/om-qa`
- **Purpose**: Processes questions and returns answers based on the OM document
- **Security**: API key is kept server-side only

### UI Components
- **TalkToOMCard**: White card displayed below AI Insights bar
- **OMQueryOverlay**: Persistent overlay for asking questions and viewing answers
- **State Persistence**: Overlay open/closed state persists across OM subpages

### OM Document Integration
- **Source**: OM content embedded directly in the API route code
- **Processing**: Full document content is sent to Gemini 2.5 Flash
- **Constraints**: AI only answers from OM content, returns "I don't know based on the OM document" for unknown questions
- **Benefits**: No file system reads, faster response times, works in serverless environments

## 4. Usage

1. Navigate to any OM Dashboard page (`/project/om/[id]/dashboard`)
2. Click the "Talk to the OM" card below the AI Insights bar
3. The overlay will open in the top-right corner
4. Type your question and click "Ask"
5. The AI will respond with information from the OM document
6. The overlay stays open until manually closed
7. State persists across navigation between OM subpages

## 5. Technical Details

### Model Configuration
- **Model**: `gemini-2.5-flash`
- **Thinking Budget**: 0 (for lower latency and cost)
- **System Instructions**: Strict rules to only use OM content

### State Management
- Uses `sessionStorage` for persistence
- Global `window` events for cross-component communication
- Mounted once in `DashboardShell` for cross-subpage persistence

### Security Features
- API key never exposed to client
- Input validation on API route
- Server-side only model calls

## 6. Testing

To test the functionality:

1. Start your development server: `npm run dev`
2. Navigate to an OM Dashboard page
3. Ask questions like:
   - "What is the total capitalization?"
   - "What are the key terms of the loan?"
   - "What amenities are included?"
   - "What is the population of the area?"

## 7. Troubleshooting

### Common Issues

**"Missing GEMINI_API_KEY" error**
- Ensure `.env.local` file exists in project root
- Verify the API key is correct
- Restart your development server after adding the environment variable

**"Failed to get answer" error**
- Verify your Gemini API key has sufficient quota
- Check browser console for detailed error messages
- Ensure the API route is properly deployed

**Overlay not opening**
- Ensure you're on an OM Dashboard page
- Check browser console for JavaScript errors
- Verify the `DashboardShell` component is properly mounted

## 8. Future Enhancements

Potential improvements that could be added:
- Rate limiting on the API endpoint
- Caching of OM content in memory
- Streaming responses for better UX
- Support for multiple OM documents
- Export functionality for Q&A sessions
- Mobile-optimized overlay (bottom sheet)

## 9. Support

For technical issues or questions about the implementation, refer to the main implementation plan in `docs/TalkToOM_Implementation_Plan.md`. 