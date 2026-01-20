{
  "entities": {
    "User": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "User",
      "type": "object",
      "description": "Represents a user of the FormFlow platform.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the user entity."
        },
        "email": {
          "type": "string",
          "description": "User's email address.",
          "format": "email"
        },
        "username": {
          "type": "string",
          "description": "User's username for login."
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp indicating when the user account was created.",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "description": "Timestamp indicating when the user account was last updated.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "email",
        "username",
        "createdAt",
        "updatedAt"
      ]
    },
    "Form": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Form",
      "type": "object",
      "description": "Represents a form created by a user.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the form entity."
        },
        "userId": {
          "type": "string",
          "description": "Reference to User. (Relationship: User 1:N Form)"
        },
        "title": {
          "type": "string",
          "description": "Title of the form."
        },
        "description": {
          "type": "string",
          "description": "Description of the form."
        },
        "questions": {
          "type": "array",
          "description": "An array of question objects embedded in the form.",
          "items": {
            "$ref": "#/backend/entities/Question"
          }
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp indicating when the form was created.",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "description": "Timestamp indicating when the form was last updated.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "userId",
        "title",
        "description",
        "questions",
        "createdAt",
        "updatedAt"
      ]
    },
    "Question": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Question",
      "type": "object",
      "description": "Represents a question within a form.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the question entity."
        },
        "formId": {
          "type": "string",
          "description": "Reference to Form. (Relationship: Form 1:N Question)"
        },
        "type": {
          "type": "string",
          "description": "Type of the question (e.g., text, multiple choice, rating, file upload)."
        },
        "text": {
          "type": "string",
          "description": "The actual question text."
        },
        "options": {
          "type": "array",
          "description": "Available options for multiple choice questions.",
          "items": {
            "type": "string"
          }
        },
        "required": {
          "type": "boolean",
          "description": "Indicates if the question is required."
        },
        "order": {
          "type": "number",
          "description": "The position of the question in form"
        }
      },
      "required": [
        "id",
        "formId",
        "type",
        "text",
        "required",
        "order"
      ]
    },
    "Response": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Response",
      "type": "object",
      "description": "Represents a user's response to a form.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the response entity."
        },
        "formId": {
          "type": "string",
          "description": "Reference to Form. (Relationship: Form 1:N Response)"
        },
        "userId": {
          "type": "string",
          "description": "Reference to User. (Relationship: User 1:N Response). Nullable for anonymous submissions."
        },
        "submittedAt": {
          "type": "string",
          "description": "Timestamp indicating when the response was submitted.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "formId",
        "submittedAt"
      ]
    },
    "Answer": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Answer",
      "type": "object",
      "description": "Represents a user's answer to a specific question in a form response.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the answer entity."
        },
        "responseId": {
          "type": "string",
          "description": "Reference to Response. (Relationship: Response 1:N Answer)"
        },
        "questionId": {
          "type": "string",
          "description": "Reference to Question. (Relationship: Question 1:N Answer)"
        },
        "value": {
          "type": "string",
          "description": "The user's answer to the question."
        }
      },
      "required": [
        "id",
        "responseId",
        "questionId",
        "value"
      ]
    },
    "Theme": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Theme",
      "type": "object",
      "description": "Represents a user's theme settings (light or dark mode).",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the theme entity."
        },
        "userId": {
          "type": "string",
          "description": "Reference to User. (Relationship: User 1:1 Theme)"
        },
        "mode": {
          "type": "string",
          "description": "The user's theme preference (e.g., 'light', 'dark')."
        }
      },
      "required": [
        "id",
        "userId",
        "mode"
      ]
    },
    "Setting": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Setting",
      "type": "object",
      "description": "Represents various settings configured by the user.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the setting entity."
        },
        "userId": {
          "type": "string",
          "description": "Reference to User. (Relationship: User 1:N Setting)"
        },
        "name": {
          "type": "string",
          "description": "Name of the setting (e.g., 'language', 'notifications')."
        },
        "value": {
          "type": "string",
          "description": "Value of the setting."
        }
      },
      "required": [
        "id",
        "userId",
        "name",
        "value"
      ]
    },
    "Analytics": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Analytics",
      "type": "object",
      "description": "Represents form usage analytics.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the analytics entity."
        },
        "formId": {
          "type": "string",
          "description": "Reference to Form. (Relationship: Form 1:N Analytics)"
        },
        "views": {
          "type": "number",
          "description": "Number of times the form has been viewed."
        },
        "submissions": {
          "type": "number",
          "description": "Number of times the form has been submitted."
        },
        "completionRate": {
          "type": "number",
          "description": "Completion rate of the form."
        },
        "averageTime": {
          "type": "number",
          "description": "Average time taken to complete the form."
        },
        "date": {
          "type": "string",
          "description": "Date of analytics data.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "formId",
        "views",
        "submissions",
        "completionRate",
        "averageTime",
        "date"
      ]
    }
  },
  "auth": {
    "providers": [
      "password",
      "anonymous"
    ]
  },
  "firestore": {
    "structure": [
      {
        "path": "/users/{userId}",
        "definition": {
          "entityName": "User",
          "schema": {
            "$ref": "#/backend/entities/User"
          },
          "description": "Stores user profiles and authentication information.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/forms/{formId}",
        "definition": {
          "entityName": "Form",
          "schema": {
            "$ref": "#/backend/entities/Form"
          },
          "description": "Stores forms created by each user. Path-based ownership is used.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "formId",
              "description": "The unique identifier of the form."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/forms/{formId}/responses/{responseId}",
        "definition": {
          "entityName": "Response",
          "schema": {
            "$ref": "#/backend/entities/Response"
          },
          "description": "Stores responses submitted for each form.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "formId",
              "description": "The unique identifier of the form."
            },
            {
              "name": "responseId",
              "description": "The unique identifier of the response."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/forms/{formId}/responses/{responseId}/answers/{answerId}",
        "definition": {
          "entityName": "Answer",
          "schema": {
            "$ref": "#/backend/entities/Answer"
          },
          "description": "Stores answers to questions within a form response.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "formId",
              "description": "The unique identifier of the form."
            },
            {
              "name": "responseId",
              "description": "The unique identifier of the response."
            },
            {
              "name": "answerId",
              "description": "The unique identifier of the answer."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/themes/{themeId}",
        "definition": {
          "entityName": "Theme",
          "schema": {
            "$ref": "#/backend/entities/Theme"
          },
          "description": "Stores theme settings for each user.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "themeId",
              "description": "The unique identifier of the theme."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/settings/{settingId}",
        "definition": {
          "entityName": "Setting",
          "schema": {
            "$ref": "#/backend/entities/Setting"
          },
          "description": "Stores user-specific settings.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "settingId",
              "description": "The unique identifier of the setting."
            }
          ]
        }
      },
      {
        "path": "/forms/{formId}/analytics/{analyticsId}",
        "definition": {
          "entityName": "Analytics",
          "schema": {
            "$ref": "#/backend/entities/Analytics"
          },
          "description": "Stores analytics data associated with each form.",
          "params": [
            {
              "name": "formId",
              "description": "The unique identifier of the form."
            },
            {
              "name": "analyticsId",
              "description": "The unique identifier of the analytics."
            }
          ]
        }
      }
    ],
    "reasoning": "The Firestore structure is designed to ensure authorization independence, clarity, and scalability for the FormFlow application.  Path-based ownership is used where appropriate (`/users/{userId}/forms/{formId}`) to secure user-owned data.  Membership maps are not needed as the application revolves around private user data, not collaborative data.  The structure also segregates data based on access needs, avoiding the need for complex rules that act as filters. This approach simplifies security rules and enhances debuggability.\n\n*   **Users:** Stores user profiles and authentication information.\n*   **Forms:**  Each user has their own collection of forms. This path-based ownership simplifies security rules, as access control is directly tied to the user's ID in the path. Questions are stored as an embedded array within the form document.\n*   **Responses:** Responses are stored as subcollections of forms (`/users/{userId}/forms/{formId}/responses/{responseId}`). Each response includes the `userId` for identifying the submitter (nullable for anonymous responses).\n*   **Answers:** Answers are stored as subcollections of responses (`/users/{userId}/forms/{formId}/responses/{responseId}/answers/{answerId}`).  This maintains the relationships between forms, responses, questions, and answers.\n*   **Themes:** Stores theme settings for each user, with a 1:1 relationship to the user.\n*   **Settings:** Stores user-specific settings, like language preferences, notifications, etc.\n*   **Analytics:** Stores analytics data associated with each form. Daily aggregation is suggested here in the `date` property to prevent unbounded collection sizes.\n\nThis structure supports the required QAPs:\n\n*   **Secure List Operations:**  The path-based ownership (`/users/{userId}/forms/{formId}`) enables secure list operations for forms and related data, as rules can simply check `request.auth.uid == userId`.\n*   **Authorization Independence:** Denormalization is not required in this design, as path-based ownership removes the need for `get()` calls to determine access.  Each entity's access is directly tied to the user ID in the path."
  }
}