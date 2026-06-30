// Shared Gmail data model used by the UI, parser, and client layers.
//
// Learning goal:
// EmailData is the small app-level model that keeps the rest of the project from
// depending directly on Gmail's nested JSON response shape.

export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}
