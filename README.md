# Study Buddy Documentation

## Overview

Study Buddy is a study aid application similar to Quizlet, designed to help users prepare for interview questions by leveraging OpenAI's API. Users can type in their answers, and the app provides corrections and suggestions for improvement.

## Features

- **OpenAI Integration**: Uses OpenAI API to evaluate user responses.
- **Customizable Questions and Answers**: Easily modify the set of questions and demo answers.
- **Interactive UI**: Responsive design with dynamic feedback on user answers.
- **Keyboard Shortcuts**: Submit answers quickly using "Ctrl + Enter".

## Repository

The source code for Study Buddy is available on GitHub:
[Study Buddy Repository](https://github.com/THEjacob1000/study-buddy)

## Prerequisites

- **OpenAI API Key**: Obtain an API key from OpenAI. [Get API Key](https://platform.openai.com/api-keys)

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/THEjacob1000/study-buddy.git
   cd study-buddy
   ```

2. **Create Environment Variable:**

   - Create a .env file in the root directory.
   - Add the following line with your OpenAI API key:

     ```bash
     OPENAI_API_KEY=<your api key here>
     ```

3. **Install Dependencies**

   ```bash
   pnpm install
   ```

4. **Run the Application:**

   ```bash
   pnpm dev
   ```

## Usage

1. **Local Development**:

   - The application is designed to be run locally for individual use.
   - To start, simply run the development server with `pnpm dev`.

2. **Remote Hosting**:
   - You can host the application remotely, but be mindful of API costs as OpenAI charges per API request.
   - Ensure your environment variables are securely managed in a production environment.

## Customization

1. **Adjusting Bot Response**:

   - Modify the system content in the `requestData` variable located at `/api/OpenAI/route.ts`.

2. **Editing Demo Answers**:
   - The array of questions and answers can be edited in `@/lib/studyQuestions.ts`.
   - Ensure the array follows the structure `{question: string, answer: string}`.

## Keyboard Shortcuts

- **Submit Answer**: Press "Ctrl + Enter" to submit your answer quickly.

## FAQ

### Does it work locally?

Yes, you can run the app in your local environment after setting the API key.

### Can I host it remotely?

Yes, you can host it remotely. However, be cautious with API key usage as it could incur costs if accessed by multiple users.

### How do I modify the bot's response?

Adjust the `system` content in `requestData` in `/api/OpenAI/route.ts`.

### How do I change the questions and answers?

Edit the array in `@/lib/studyQuestions.ts` to include your desired questions and answers.

## Contributions

Feel free to contribute to the project by forking the repository and submitting pull requests.

---

### **Created by Jacob Sanderson**
