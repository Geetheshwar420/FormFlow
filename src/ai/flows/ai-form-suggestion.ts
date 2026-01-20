'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting form fields based on a document snippet.
 *
 * The flow takes a document snippet as input and returns a list of suggested form fields.
 * It exports:
 * - `suggestFormFields`: The main function to call to get form field suggestions.
 * - `AIFormSuggestionInput`: The input type for the suggestFormFields function.
 * - `AIFormSuggestionOutput`: The output type for the suggestFormFields function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIFormSuggestionInputSchema = z.object({
  documentSnippet: z
    .string()
    .describe('A snippet of text from a document to analyze for form field suggestions.'),
});
export type AIFormSuggestionInput = z.infer<typeof AIFormSuggestionInputSchema>;

const AIFormSuggestionOutputSchema = z.object({
  suggestedFields: z
    .array(z.string())
    .describe('An array of suggested form fields based on the document snippet.'),
});
export type AIFormSuggestionOutput = z.infer<typeof AIFormSuggestionOutputSchema>;

export async function suggestFormFields(
  input: AIFormSuggestionInput
): Promise<AIFormSuggestionOutput> {
  return aiFormSuggestionFlow(input);
}

const aiFormSuggestionPrompt = ai.definePrompt({
  name: 'aiFormSuggestionPrompt',
  input: {schema: AIFormSuggestionInputSchema},
  output: {schema: AIFormSuggestionOutputSchema},
  prompt: `You are an AI assistant helping users create forms from document snippets.

  Given the following document snippet, suggest a list of relevant form fields that would be useful for capturing the information in the document.

  Document Snippet: {{{documentSnippet}}}

  Please provide the suggestions as a list of strings.
  Do not include any explanation, only provide the list of suggested form fields.
  `,
});

const aiFormSuggestionFlow = ai.defineFlow(
  {
    name: 'aiFormSuggestionFlow',
    inputSchema: AIFormSuggestionInputSchema,
    outputSchema: AIFormSuggestionOutputSchema,
  },
  async input => {
    const {output} = await aiFormSuggestionPrompt(input);
    return output!;
  }
);
