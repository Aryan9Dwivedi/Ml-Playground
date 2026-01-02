import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Quiz({ quiz, onComplete, onClose, tutorialTitle }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  
  const handleAnswerSelect = (optionIndex) => {
    if (!answerSubmitted) {
      setSelectedAnswer(optionIndex);
    }
  };
  
  const handleSubmitAnswer = () => {
    setAnswerSubmitted(true);
    setAnswers({ ...answers, [currentQuestion]: selectedAnswer });
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    }
  };
  
  const calculateResults = () => {
    const finalAnswers = { ...answers, [currentQuestion]: selectedAnswer };
    let correct = 0;
    
    quiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    onComplete(score, passed);
  };
  
  const isCorrect = answerSubmitted && selectedAnswer === question.correctAnswer;
  const isIncorrect = answerSubmitted && selectedAnswer !== question.correctAnswer;
  
  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{tutorialTitle} - Quiz</h2>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>Passing Score: {quiz.passingScore}%</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Question */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
            <h3 className="text-xl font-semibold text-white leading-relaxed">
              {question.question}
            </h3>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isThisCorrect = index === question.correctAnswer;
              const showCorrect = answerSubmitted && isThisCorrect;
              const showIncorrect = answerSubmitted && isSelected && !isThisCorrect;
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answerSubmitted}
                  whileHover={!answerSubmitted ? { scale: 1.02 } : {}}
                  whileTap={!answerSubmitted ? { scale: 0.98 } : {}}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showCorrect
                      ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : showIncorrect
                      ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/20'
                      : isSelected && !answerSubmitted
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  } ${answerSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      showCorrect
                        ? 'bg-emerald-500 text-white'
                        : showIncorrect
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {showCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                       showIncorrect ? <XCircle className="w-5 h-5" /> :
                       String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-white">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Feedback */}
          <AnimatePresence>
            {answerSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-amber-500/10 border-amber-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      
      {/* Actions */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
        <Button onClick={onClose} variant="outline" className="border-slate-600 text-slate-300">
          Exit Quiz
        </Button>
        
        {!answerSubmitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-50"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-gradient-to-r from-cyan-600 to-blue-600">
            {isLastQuestion ? 'See Results' : 'Next Question'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}