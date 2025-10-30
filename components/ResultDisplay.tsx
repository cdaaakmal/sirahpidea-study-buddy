import React, { useState } from 'react';
import { StudyMaterialType, GeneratedContent, QuizQuestion, TimelineEvent, Flashcard } from '../types';

interface ResultDisplayProps {
  content: GeneratedContent | null;
  type: StudyMaterialType;
  topic: string;
  topicKey: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
  t: (key: string) => string;
  language: string;
}

interface DisplayComponentProps {
    onRegenerate: () => void;
    isRegenerating: boolean;
    topic: string;
    topicKey: string;
    t: (key: string) => string;
    language: string;
}

// FIX: Added 'language' to props to fix "Cannot find name 'language'" error.
const ShareButton: React.FC<{ topicKey: string, type: StudyMaterialType, t: (key: string) => string; language: string; }> = ({ topicKey, type, t, language }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('topicKey', topicKey);
        url.searchParams.set('type', type);
        navigator.clipboard.writeText(url.toString()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error('Failed to copy URL: ', err));
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center justify-center bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
            aria-label="Share this content"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {copied ? t('copied') : t('share')}
        </button>
    );
};


const RegenerateButton: React.FC<Pick<DisplayComponentProps, 'onRegenerate' | 'isRegenerating' | 't' | 'language'>> = ({ onRegenerate, isRegenerating, t, language }) => (
    <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="flex items-center justify-center bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-semibold py-2 px-4 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900 transition-colors duration-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        aria-label="Regenerate content"
    >
        {isRegenerating ? (
            <>
                <svg className={`animate-spin h-5 w-5 ${language === 'ar' ? 'ml-2' : '-ml-1 mr-2'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('regenerating')}
            </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 0114.12-4.24M20 15a8 8 0 01-14.12 4.24" />
                </svg>
                {t('regenerate')}
            </>
        )}
    </button>
);

const ResultCard: React.FC<React.PropsWithChildren<{ title: string, topic: string, t: (key: string) => string }>> = ({ children, title, topic, t }) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 p-6 rounded-xl shadow-lg animate-fade-in">
        <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            {t('forTopic')} <span className="font-semibold">"{topic}"</span>
        </p>
        {children}
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
);


const SummaryDisplay: React.FC<{ content: string } & DisplayComponentProps> = ({ content, topicKey, ...props }) => (
  <ResultCard title={props.t(StudyMaterialType.SUMMARY.toLowerCase())} topic={props.topic} t={props.t}>
    <div className="flex justify-end items-center mb-4 gap-2">
        {/* FIX: Passed language prop to ShareButton. */}
        <ShareButton topicKey={topicKey} type={StudyMaterialType.SUMMARY} t={props.t} language={props.language} />
        <RegenerateButton onRegenerate={props.onRegenerate} isRegenerating={props.isRegenerating} t={props.t} language={props.language} />
    </div>
    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed">
      {content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  </ResultCard>
);

const QuizDisplay: React.FC<{ content: QuizQuestion[] } & DisplayComponentProps> = ({ content, topicKey, ...props }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = () => setIsSubmitted(true);
    const handleReset = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
    };
    
    const getScore = () => {
        return content.reduce((score, question, index) => {
            return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
    };

    return (
        <ResultCard title={props.t(StudyMaterialType.QUIZ.toLowerCase())} topic={props.topic} t={props.t}>
            <div className="flex justify-end items-center mb-4">
                 <div className="flex items-center gap-2">
                    {isSubmitted && (
                        <div className="text-lg font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full">
                            {props.t('score')}: {getScore()} / {content.length}
                        </div>
                    )}
                    {/* FIX: Passed language prop to ShareButton. */}
                    <ShareButton topicKey={topicKey} type={StudyMaterialType.QUIZ} t={props.t} language={props.language} />
                    <RegenerateButton onRegenerate={props.onRegenerate} isRegenerating={props.isRegenerating} t={props.t} language={props.language} />
                 </div>
            </div>
            <div className="space-y-6">
                {content.map((q, qIndex) => (
                    <div key={qIndex} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                        <p className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-200">{qIndex + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((option, oIndex) => {
                                const isCorrect = option === q.correctAnswer;
                                const isSelected = selectedAnswers[qIndex] === option;
                                let optionClass = "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700";

                                if (isSubmitted) {
                                    if (isCorrect) {
                                        optionClass = "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/50 dark:border-green-600 dark:text-green-200 ring-2 ring-green-300";
                                    } else if (isSelected) {
                                        optionClass = "bg-red-100 border-red-400 text-red-800 dark:bg-red-900/50 dark:border-red-600 dark:text-red-200";
                                    }
                                } else if (isSelected) {
                                    optionClass = "bg-primary-100 border-primary-400 dark:bg-primary-900/50 dark:border-primary-600 ring-2 ring-primary-300";
                                }

                                return (
                                    <label key={oIndex} className={`flex items-center p-3 rounded-md border cursor-pointer transition-all duration-200 ${optionClass}`}>
                                        <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={() => handleAnswerChange(qIndex, option)}
                                            disabled={isSubmitted}
                                            className={`w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 ${props.language === 'ar' ? 'ml-3' : 'mr-3'}`}
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {!isSubmitted ? (
                 <button 
                    onClick={handleSubmit} 
                    className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-slate-400"
                    disabled={Object.keys(selectedAnswers).length !== content.length}
                >
                    {props.t('submitQuiz')}
                </button>
            ) : (
                <button 
                    onClick={handleReset} 
                    className="mt-6 w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                    {props.t('retryQuiz')}
                </button>
            )}
        </ResultCard>
    );
};

const TimelineDisplay: React.FC<{ content: TimelineEvent[] } & DisplayComponentProps> = ({ content, topicKey, ...props }) => (
    <ResultCard title={props.t(StudyMaterialType.TIMELINE.toLowerCase())} topic={props.topic} t={props.t}>
        <div className="flex justify-end items-center mb-6 gap-2">
            {/* FIX: Passed language prop to ShareButton. */}
            <ShareButton topicKey={topicKey} type={StudyMaterialType.TIMELINE} t={props.t} language={props.language} />
            <RegenerateButton onRegenerate={props.onRegenerate} isRegenerating={props.isRegenerating} t={props.t} language={props.language} />
        </div>
        <div className={`relative ${props.language === 'ar' ? 'border-r-2 mr-4 pr-4' : 'border-l-2 ml-4 pl-4'} border-primary-300 dark:border-primary-700`}>
            {content.map((item, index) => (
                <div key={index} className="mb-8">
                    <span className={`absolute flex items-center justify-center w-8 h-8 bg-primary-200 rounded-full ring-4 ring-white dark:ring-slate-800 dark:bg-primary-900 ${props.language === 'ar' ? '-right-4' : '-left-4'}`}>
                         <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                        </svg>
                    </span>
                    <h4 className="flex items-center mb-1 text-lg font-semibold text-slate-900 dark:text-white">{item.event}</h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-slate-500 dark:text-slate-400">{item.date}</time>
                    <p className="text-base font-normal text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
            ))}
        </div>
    </ResultCard>
);

const FlashcardDisplay: React.FC<{ content: Flashcard[] } & DisplayComponentProps> = ({ content, topicKey, ...props }) => {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});

    const handleFlip = (index: number) => {
        setFlipped(prev => ({...prev, [index]: !prev[index]}));
    }

    return (
        <ResultCard title={props.t(StudyMaterialType.FLASHCARDS.toLowerCase())} topic={props.topic} t={props.t}>
             <div className="flex justify-end items-center mb-4 gap-2">
                {/* FIX: Passed language prop to ShareButton. */}
                <ShareButton topicKey={topicKey} type={StudyMaterialType.FLASHCARDS} t={props.t} language={props.language} />
                <RegenerateButton onRegenerate={props.onRegenerate} isRegenerating={props.isRegenerating} t={props.t} language={props.language} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{props.t('flipInstructions')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {content.map((card, index) => (
                    <div key={index} className="perspective-1000 group" onClick={() => handleFlip(index)}>
                        <div className={`relative w-full h-48 transition-transform duration-500 transform-style-preserve-3d ${flipped[index] ? 'rotate-y-180' : ''}`}>
                            {/* Front of card */}
                            <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-primary-600 text-white rounded-lg shadow-lg cursor-pointer group-hover:scale-105 transition-transform">
                                <h4 className="text-xl font-bold text-center">{card.term}</h4>
                            </div>
                            {/* Back of card */}
                             <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-lg cursor-pointer rotate-y-180 group-hover:scale-105 transition-transform">
                                <p className="text-center">{card.definition}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </ResultCard>
    );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, type, ...props }) => {
  if (!content) {
    return null;
  }

  const displayProps = { ...props };

  switch (type) {
    case StudyMaterialType.SUMMARY:
      return <SummaryDisplay content={content as string} {...displayProps} />;
    case StudyMaterialType.QUIZ:
      return <QuizDisplay content={content as QuizQuestion[]} {...displayProps} />;
    case StudyMaterialType.TIMELINE:
      return <TimelineDisplay content={content as TimelineEvent[]} {...displayProps} />;
    case StudyMaterialType.FLASHCARDS:
        return <FlashcardDisplay content={content as Flashcard[]} {...displayProps} />;
    default:
      return <div className="text-red-500">Error: Unknown content type.</div>;
  }
};

export default ResultDisplay;