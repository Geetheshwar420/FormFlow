# FormFlow

FormFlow is a powerful and intuitive platform for creating, sharing, and analyzing online forms and surveys. Built with a modern tech stack, it provides a seamless experience for both form creators and respondents.

## ✨ Key Features

- **Intuitive Form Builder:** A user-friendly interface to easily create and customize forms.
- **Multiple Question Types:** Supports short text, paragraph, multiple choice, checkboxes, and ratings.
- **Real-time Analytics:** Visualize responses with automatically generated charts and graphs.
- **Advanced Filtering:** Segment your response data based on answers to specific questions.
- **Data Export:** Download your form data in CSV, JSON, or PDF formats for reporting and analysis.
- **Secure Authentication:** User accounts are protected with Firebase Authentication, including email/password and Google sign-in.
- **Sharable Links:** Share your forms with a clean, short URL.
- **Respondent Verification:** Optionally require users to sign in to respond, capturing their email address.
- **Customizable Theme:** Switch between light and dark modes to suit your preference.

## 🚀 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Charts:** [Recharts](https://recharts.org/)

## 🏁 Getting Started

To run this project on your local machine, you'll need to have [Node.js](https://nodejs.org/) and npm installed.

### 1. Get the code

First, get the code onto your machine.

### 2. Install Dependencies

Navigate to the project directory in your terminal and run:

```bash
npm install
```

This will install all the necessary packages defined in `package.json`.

### 3. Set up Firebase

The project is configured to connect to a Firebase project. You will need to have your own Firebase project and replace the configuration in `src/firebase/config.ts` with your own project's credentials.

### 4. Run the Development Server

Once the dependencies are installed, you can start the development server:

```bash
npm run dev
```

This will start the application on `http://localhost:9002` by default. You can now open this URL in your browser to see the application.
