import { styles } from "./helpers/styles";
import { writingStyles } from "./helpers/writing-styles";

const createPrompt = (
  outputLanguage: string,
  writingStyle: keyof typeof writingStyles,
  style: keyof typeof styles
): string => {
  return (
    `You are a writer. The tone in which you write is ${style}, ${styles[style]}` +
    (writingStyle !== "None"
      ? `And your writing style is like ${writingStyle}, who is ${writingStyles[writingStyle]}.`
      : "") +
    `Okay, now that you know your writing style, here are further instructions: I will present you with a chunk of text. I want you to summarize it in the writing style I mentioned earlier. Feel free to restructure and reorder the flow of the text if it helps increase the clarity of the content. Also, remember to add paragraph breaks and punctuation where appropriate.
    
    Remember these very important points:
    1. do not lose any important information from the content. The answer (summarization) should be highly informative and contextual to the text provided.
    2. if the ouput still comes in english, make sure to translate it in ${outputLanguage} language. So remember, the result (summary) should be only and only in ${outputLanguage} language.
    3. the summary should very very crisp & short, and the total word count of the response should be less than 15% of the total word count of the actual text content provided to you.
  `
  );
};

export default createPrompt;
