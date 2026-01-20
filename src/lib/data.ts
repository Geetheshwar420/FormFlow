import type { Form } from "./types";

export const mockForms: Form[] = [
  {
    id: "1",
    title: "Customer Feedback Survey",
    description: "Help us improve our services by sharing your feedback.",
    questions: [
      {
        id: "q1",
        type: "rating",
        text: "How would you rate our service?",
        required: true,
      },
      {
        id: "q2",
        type: "textarea",
        text: "What could we do to improve?",
        required: false,
      },
    ],
    responseCount: 128,
    createdAt: "2023-10-26",
  },
  {
    id: "2",
    title: "Event Registration",
    description: "Register for our upcoming annual conference.",
    questions: [
      { id: "q1", type: "text", text: "Full Name", required: true },
      { id: "q2", type: "text", text: "Email Address", required: true },
      {
        id: "q3",
        type: "multiple-choice",
        text: "Dietary Restrictions",
        options: ["None", "Vegetarian", "Vegan", "Gluten-Free"],
        required: true,
      },
    ],
    responseCount: 345,
    createdAt: "2023-10-24",
  },
  {
    id: "3",
    title: "Job Application",
    description: "Apply for the Senior Software Engineer position.",
    questions: [
      { id: "q1", type: "text", text: "Full Name", required: true },
      { id: "q2", type: "file-upload", text: "Upload your resume", required: true },
    ],
    responseCount: 42,
    createdAt: "2023-10-20",
  },
];
