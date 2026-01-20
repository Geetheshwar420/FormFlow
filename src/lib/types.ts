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

export type Form = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  responseCount: number;
  createdAt: string;
};
