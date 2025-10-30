
export enum StudyMaterialType {
  SUMMARY = 'Summary',
  QUIZ = 'Quiz',
  TIMELINE = 'Timeline',
  FLASHCARDS = 'Flashcards',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  description: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export type GeneratedContent = string | QuizQuestion[] | TimelineEvent[] | Flashcard[];
   