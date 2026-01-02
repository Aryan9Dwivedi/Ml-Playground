import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronLeft, CheckCircle2, X, Lightbulb, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Quiz from './Quiz';

export default function TutorialSystem({ tutorial, onClose, renderInteractive }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [quizScore, setQuizScore] = useState(null);
  
  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;
  
  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (isLastStep) {
      setShowQuiz(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const handleQuizComplete = (score, passed) => {
    setQuizScore({ score, passed });
  };
  
  if (showQuiz && !quizScore) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <Quiz quiz={tutorial.quiz} onComplete={handleQuizComplete} onClose={onClose} tutorialTitle={tutorial.title} />
        </motion.div>
      </motion.div>
    );
  }
  
  if (quizScore) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-2xl w-full p-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              {quizScore.passed ? (
                <Award className="w-20 h-20 text-emerald-400 mx-auto" />
              ) : (
                <Target className="w-20 h-20 text-amber-400 mx-auto" />
              )}
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-3">
              {quizScore.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
            </h2>
            
            <p className="text-slate-300 text-lg mb-6">
              You scored <span className="text-2xl font-bold text-cyan-400">{quizScore.score}%</span>
            </p>
            
            {quizScore.passed ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-6 mb-6">
                <p className="text-emerald-300 leading-relaxed">
                  You've completed the <strong>{tutorial.title}</strong> tutorial! 
                  You now understand the core concepts and are ready to explore more advanced topics.
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-6 mb-6">
                <p className="text-amber-300 leading-relaxed">
                  Don't worry! Review the tutorial content and try again. 
                  Understanding takes time, and you're on the right track. 
                  Score {tutorial.quiz.passingScore}% to pass.
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              {!quizScore.passed && (
                <Button onClick={() => { setShowQuiz(true); setQuizScore(null); }} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  Retake Quiz
                </Button>
              )}
              <Button onClick={() => { setCurrentStep(0); setShowQuiz(false); setQuizScore(null); }} variant="outline" className="border-slate-600 text-slate-300">
                Review Tutorial
              </Button>
              <Button onClick={onClose} variant="outline" className="border-slate-600 text-slate-300">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{tutorial.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{tutorial.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Step {currentStep + 1} of {tutorial.steps.length}</span>
              <span className="text-cyan-400 font-semibold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{step.content}</p>
                </div>
              </div>
              
              {/* Key Concept */}
              {step.keyConcept && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-purple-300 font-semibold mb-2">💡 Key Concept</h4>
                      <p className="text-slate-300 leading-relaxed">{step.keyConcept}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Interactive Demo */}
              {step.interactive && renderInteractive && (
                <div className="bg-slate-950 border-2 border-cyan-500/30 rounded-xl p-6">
                  <h4 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Interactive Demo: {step.interactive.title}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4">{step.interactive.instruction}</p>
                  {renderInteractive(step.interactive)}
                </div>
              )}
              
              {/* Formula/Math */}
              {step.formula && (
                <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-5">
                  <h4 className="text-blue-300 font-semibold mb-3">📐 Mathematical Formula</h4>
                  <div className="font-mono text-lg text-white bg-slate-900/50 rounded-lg p-4 mb-3">
                    {step.formula}
                  </div>
                  {step.formulaExplanation && (
                    <p className="text-slate-300 text-sm">{step.formulaExplanation}</p>
                  )}
                </div>
              )}
              
              {/* Example */}
              {step.example && (
                <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-xl p-5">
                  <h4 className="text-emerald-300 font-semibold mb-3">✨ Example</h4>
                  <p className="text-slate-300 leading-relaxed">{step.example}</p>
                </div>
              )}
              
              {/* Tips */}
              {step.tips && step.tips.length > 0 && (
                <div className="space-y-2">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="text-amber-400 text-lg">💡</span>
                      <p className="text-slate-300 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="border-slate-600 text-slate-300 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {tutorial.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-8 bg-cyan-500' :
                  completedSteps.has(i) ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            {isLastStep ? (
              <>
                Take Quiz <Award className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}