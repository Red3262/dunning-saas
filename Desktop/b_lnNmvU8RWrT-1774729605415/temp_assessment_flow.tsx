\'use client\';

import React, { useState } from \'react\';
import { QUESTIONS, Question } from \'../lib/questionBank\';

export default function AssessmentFlow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentInputValue, setCurrentInputValue] = useState<string | number>(\'\');

  const currentQuestion: Question = QUESTIONS[currentIndex];
  const progressPercentage = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    // Save current answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: currentInputValue,
    }));

    // Move to next question or finish
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentInputValue(\'\'); // Reset input for the next question
    } else {
      console.log(\'Assessment Complete. Ready to send to Gemini API:\', answers);
      // Here is where we will eventually trigger the Gemini API call
      alert(\'Assessment complete! Check the console for the JSON payload.\');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Restore previous answer if it exists
      setCurrentInputValue(answers[QUESTIONS[currentIndex - 1].id] || \'\');
    }
  };

  return (
    <div className=\"min-h-screen bg-[#F5F5F0] text-[#111111] font-sans flex flex-col items-center justify-center p-6\">
      <div className=\"w-full max-w-3xl space-y-12\">
        
        {/* Progress Bar Header */}
        <div className=\"space-y-4\">
          <div className=\"flex justify-between items-center text-sm font-bold tracking-widest uppercase\">
            <span>Phase {Math.floor(currentIndex / 5) + 1}</span>
            <span>{currentIndex + 1} / {QUESTIONS.length}</span>
          </div>
          <div className=\"w-full h-1 bg-gray-300\">
            <div 
              className=\"h-full bg-[#111111] transition-all duration-500 ease-out\"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Container */}
        <div className=\"space-y-10 min-h-[300px]\">
          <h2 className=\"text-4xl md:text-5xl font-serif font-bold leading-tight tracking-tight\">\
            {currentQuestion.questionTitle}
          </h2>

          {/* Dynamic Inputs Based on Question Type */}
          <div className=\"pt-6\">
            
            {/* TEXT AREA */}
            {currentQuestion.type === \'text-area\' && (\n              <textarea
                value={currentInputValue as string}
                onChange={(e) => setCurrentInputValue(e.target.value)}
                placeholder=\"Type your answer here...\"
                className=\"w-full h-40 p-6 bg-transparent border-2 border-[#111111] text-xl focus:outline-none focus:ring-0 resize-none rounded-none placeholder-gray-400\"
              />
            )}

            {/* MULTIPLE CHOICE */}
            {currentQuestion.type === \'multiple-choice\' && (\n              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => setCurrentInputValue(option)}
                    className={`p-6 text-left border-2 border-[#111111] transition-all duration-200 rounded-none text-lg font-medium
                      ${currentInputValue === option 
                        ? \'bg-[#111111] text-[#F5F5F0]\' 
                        : \'bg-transparent hover:bg-gray-200\'}`}\
                  >
                    {option}
                  </button>
                ))}\
              </div>
            )}

            {/* SLIDER */}
            {currentQuestion.type === \'slider\' && (\n              <div className=\"space-y-8 pt-8\">
                <input
                  type=\"range\"
                  min=\"1\"
                  max=\"100\"
                  value={currentInputValue || 50}
                  onChange={(e) => setCurrentInputValue(Number(e.target.value))}
                  className=\"w-full accent-[#111111] h-2 bg-gray-300 rounded-none appearance-none cursor-pointer\"
                />
                <div className=\"flex justify-between text-sm font-bold uppercase tracking-widest text-gray-600\">
                  <span>{currentQuestion.minLabel}</span>
                  <span>{currentQuestion.maxLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className=\"flex justify-between pt-12 border-t-2 border-[#111111]\">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`px-8 py-4 font-bold tracking-widest uppercase transition-opacity
              ${currentIndex === 0 ? \'opacity-30 cursor-not-allowed\' : \'opacity-100 hover:bg-gray-200\'}`}\
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestion.type !== \'slider\' && !currentInputValue}
            className={`px-12 py-4 bg-[#111111] text-[#F5F5F0] font-bold tracking-widest uppercase transition-transform hover:-translate-y-1
              ${(currentQuestion.type !== \'slider\' && !currentInputValue) ? \'opacity-50 cursor-not-allowed hover:translate-y-0\' : \'opacity-100\'}`}\
          >
            {currentIndex === QUESTIONS.length - 1 ? \'Reveal Archetype\' : \'Continue →\'}
          </button>
        </div>

      </div>
    </div>
  );
}