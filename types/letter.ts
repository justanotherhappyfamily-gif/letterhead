export interface LetterheadItem {
  id?: string;
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  bodyText: string;
  includeSignature: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}
