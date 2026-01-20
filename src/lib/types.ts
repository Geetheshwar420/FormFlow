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
  userId: string;
  title: string;
  description: string;
  questions: Question[];
  responseCount: number;
  createdAt: string;
  updatedAt?: string;
  requiresSignIn?: boolean;
  editors?: string[];
};

export type FormResponse = {
  id: string;
  formId: string;
  formOwnerId: string;
  submittedAt: string;
  answers: {
    questionId: string;
    value: string | string[] | number;
  }[];
}
