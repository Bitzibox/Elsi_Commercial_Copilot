
import { FunctionDeclaration, Type } from '@google/genai';

export const quoteTools: FunctionDeclaration[] = [
  {
    name: 'create_quote',
    description: 'Create a new business quote (devis). Collect client info, items, and pricing from the user first.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING, description: "Name of the client or company" },
        clientCity: { type: Type.STRING, description: "City of the client" },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER }
            }
          }
        },
        validDays: { type: Type.NUMBER, description: "Number of days the quote is valid for (default 30)" }
      },
      required: ['clientName', 'items']
    }
  },
  {
    name: 'list_quotes',
    description: 'List all existing quotes to check statuses or details.',
    parameters: {
      type: Type.OBJECT,
      properties: {} // No params needed
    }
  },
  {
      name: 'delete_quote',
      description: 'Delete a quote by its reference ID.',
      parameters: {
          type: Type.OBJECT,
          properties: {
              referenceId: { type: Type.STRING, description: "The reference ID of the quote (e.g., Q-2024-001)"}
          },
          required: ['referenceId']
      }
  }
];
