
import { FunctionDeclaration, Type } from '@google/genai';

export const quoteTools: FunctionDeclaration[] = [
  {
    name: 'create_quote',
    description: 'Create a new business quote (devis). You must have the Client Name AND at least one Item (Description, Price) before calling this. Do not call this with empty items.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING, description: "Name of the client or company. Mandatory." },
        clientCity: { type: Type.STRING, description: "City of the client" },
        items: {
          type: Type.ARRAY,
          description: "List of items/services. Mandatory. Cannot be empty.",
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Description of the service or product" },
              quantity: { type: Type.NUMBER, description: "Quantity" },
              unitPrice: { type: Type.NUMBER, description: "Price per unit in Euros" }
            },
            required: ['description', 'quantity', 'unitPrice']
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
