export type QuestionType =
  | "text"
  | "textarea"
  | "multiple-choice"
  | "checkboxes"
  | "rating"
  | "file-upload";

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
};

// This represents the structure of a question as stored in Firestore, without the client-side 'id'
export type QuestionDTO = Omit<Question, 'id'>;

export type Form = {
  id: string;
  title: string;
  description: string;
  questions: QuestionDTO[];
  responseCount: number;
  createdAt: string;
  updatedAt?: string;
};
