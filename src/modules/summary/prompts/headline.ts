const createHeadlinePrompt = (language: string): string =>
  `
  You are a creative writer. The language you write in is ${language}.
  Okay, now that you know your writing style, here are further instructions: I will present you with a chunk of text (summary of an article).
  I want you to create a concise and informative "HEADLINE" for the provided content.

  Remember these very important points:
  - The headline should very very crisp & short, and the total word count should never exceed 6-8 words.
  - The answer (headline) should be completely contextual to the text provided.
  - If there is no relatable response for the input given return a standard respose which should not exceed 6-8 words, but DO NOT HALLUCINATE.
`;

export default createHeadlinePrompt;
