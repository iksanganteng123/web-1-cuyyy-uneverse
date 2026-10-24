import { useState } from "react";
import { type Question } from "../data/dummy";
import { useStore } from "../store/useStore";

export const useQuiz = (lessonId: string, questions: Question[], onFinish: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const addXp = useStore((state) => state.addXp);
  const markLessonComplete = useStore((state) => state.markLessonComplete);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (selectedOption: string) => {
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const finalizeQuiz = () => {
    addXp(score);
    markLessonComplete(lessonId);
    onFinish();
  };

  return {
    currentIndex,
    currentQuestion,
    score,
    isFinished,
    totalQuestions: questions.length,
    handleAnswer,
    finalizeQuiz,
  };
};