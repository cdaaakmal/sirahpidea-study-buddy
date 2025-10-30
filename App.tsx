import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StudyMaterialType, GeneratedContent } from './types';
import { generateStudyMaterial } from './services/geminiService';
import ResultDisplay from './components/ResultDisplay';

const studyTopics: Record<string, Record<string, string>> = {
    birth: {
        ms: "Kelahiran Baginda SAW (570M - 576M)",
        en: "Birth of the Prophet SAW (570M - 576M)",
        ar: "ميلاد النبي ﷺ (٥٧٠م - ٥٧٦م)"
    },
    youth: {
        ms: "Remaja & Perwatakan Baginda SAW (576M - 595M)",
        en: "Adolescence & Character of the Prophet SAW (576M - 595M)",
        ar: "شبابه وتكوين شخصيته (٥٧٦م - ٥٩٥م)"
    },
    marriage: {
        ms: "Berkahwin dengan Khadijah (595M - 610M)",
        en: "Marriage with Khadijah (595M - 610M)",
        ar: "الزواج من خديجة (٥٩٥م - ٦١٠م)"
    },
    revelation: {
        ms: "Permulaan Wahyu dan Dakwah Baginda SAW (610M - 613M)",
        en: "Beginning of Revelation and Da'wah (610M - 613M)",
        ar: "بداية الوحي والدعوة (٦١٠م - ٦١٣م)"
    },
    open_dawah: {
        ms: "Dakwah Secara Terbuka (613M - 622M)",
        en: "Open Da'wah (613M - 622M)",
        ar: "الدعوة الجهرية (٦١٣م - ٦٢٢م)"
    },
    hijrah: {
        ms: "Hijrah Baginda SAW ke Madinah (622M / 1H)",
        en: "Hijrah of the Prophet SAW to Madinah (622M / 1H)",
        ar: "هجرة النبي ﷺ إلى المدينة (٦٢٢م / ١هـ)"
    }
};

const translations: Record<string, Record<string, string>> = {
  en: {
    selectChapter: "Select a Chapter",
    materialType: "Material Type",
    summary: "Summary",
    quiz: "Quiz",
    timeline: "Timeline",
    flashcards: "Flashcards",
    createButton: "Create Study Material",
    generatingButton: "Generating...",
    welcomeTitle: "Welcome to Your Study Buddy!",
    welcomeMessage: "Select a chapter, pick a study tool, and let AI help you learn smarter, not harder.",
    loadingMessage: "Crafting your study materials...",
    loadingSubMessage: "This might take a moment.",
    forTopic: "For topic:",
    share: "Share",
    copied: "Copied!",
    regenerate: "Regenerate",
    regenerating: "Regenerating...",
    score: "Score",
    submitQuiz: "Submit Quiz",
    retryQuiz: "Retry Quiz",
    flipInstructions: "Click on a card to flip it.",
    errorTitle: "Error",
  },
  ms: {
    selectChapter: "Pilih Bab",
    materialType: "Jenis Bahan",
    summary: "Ringkasan",
    quiz: "Kuiz",
    timeline: "Garis Masa",
    flashcards: "Kad Imbas",
    createButton: "Hasilkan Bahan Kajian",
    generatingButton: "Menjana...",
    welcomeTitle: "Selamat Datang ke Rakan Belajar Anda!",
    welcomeMessage: "Pilih bab, pilih alat belajar, dan biarkan AI membantu anda belajar dengan lebih bijak.",
    loadingMessage: "Menyediakan bahan kajian anda...",
    loadingSubMessage: "Ini mungkin mengambil sedikit masa.",
    forTopic: "Untuk topik:",
    share: "Kongsi",
    copied: "Disalin!",
    regenerate: "Jana Semula",
    regenerating: "Menjana semula...",
    score: "Skor",
    submitQuiz: "Hantar Kuiz",
    retryQuiz: "Cuba Semula Kuiz",
    flipInstructions: "Klik pada kad untuk membalikkannya.",
    errorTitle: "Ralat",
  },
  ar: {
    selectChapter: "اختر فصلاً",
    materialType: "نوع المادة",
    summary: "ملخص",
    quiz: "اختبار",
    timeline: "خط زمني",
    flashcards: "بطاقات تعليمية",
    createButton: "إنشاء مادة دراسية",
    generatingButton: "جاري الإنشاء...",
    welcomeTitle: "أهلاً بك في صديق دراستك!",
    welcomeMessage: "اختر فصلاً، اختر أداة دراسة، ودع الذكاء الاصطناعي يساعدك على التعلم بذكاء.",
    loadingMessage: "جاري إعداد موادك الدراسية...",
    loadingSubMessage: "قد يستغرق هذا بعض الوقت.",
    forTopic: "للموضوع:",
    share: "مشاركة",
    copied: "تم النسخ!",
    regenerate: "إعادة إنشاء",
    regenerating: "جاري الإعادة...",
    score: "النتيجة",
    submitQuiz: "إرسال الاختبار",
    retryQuiz: "إعادة الاختبار",
    flipInstructions: "انقر على البطاقة لقلبها.",
    errorTitle: "خطأ",
  }
};


const LoadingSpinner: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('loadingMessage')}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('loadingSubMessage')}</p>
    </div>
);

const WelcomeMessage: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
         <svg className="w-24 h-24 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0A9.043 9.043 0 0 1 9 7.5a9.018 9.018 0 0 0-3 5.25m6 0A9.043 9.043 0 0 0 15 7.5a9.018 9.018 0 0 1 3 5.25m-3 0h3m-3 0a9.043 9.043 0 0 1-3 5.25m0 0A9.018 9.018 0 0 0 9 12.75m6 0A9.018 9.018 0 0 1 15 12.75" />
        </svg>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t('welcomeTitle')}</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl">
            {t('welcomeMessage')}
        </p>
    </div>
);


const Header: React.FC<{
    t: (key: string) => string;
    language: string;
    setLanguage: (lang: string) => void;
}> = ({ t, language, setLanguage }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setDarkMode(!darkMode);
    };

    return (
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a6.375 6.375 0 0 0 6.375-6.375V9.75A6.375 6.375 0 0 0 12 3.375Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.375c-6.375 0-6.375 6.375-6.375 6.375V18.375M12 18.375A6.375 6.375 0 0 1 5.625 12v-2.25A6.375 6.375 0 0 1 12 3.375" />
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                    Sirahpidea Study Buddy
                </h1>
              </div>
              <div className="flex items-center gap-4">
                  <div className="relative">
                      <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 pl-3 pr-8 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                          aria-label="Select language"
                      >
                          <option value="ms">Bahasa Melayu</option>
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                      </select>
                       <svg className="w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                  </div>
                  <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      {darkMode ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                      )}
                  </button>
              </div>
          </div>
      </header>
    );
};

const MaterialTypeButton: React.FC<{
    type: StudyMaterialType;
    currentType: StudyMaterialType;
    onClick: (type: StudyMaterialType) => void;
    children: React.ReactNode;
    language: string;
}> = ({ type, currentType, onClick, children, language }) => (
    <button
        onClick={() => onClick(type)}
        className={`w-full flex items-center justify-center text-left px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-primary-500 ${
            currentType === type
            ? 'bg-primary-600 text-white shadow-md scale-105'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
        }`}
    >
        {children}
    </button>
);

const App: React.FC = () => {
  const [topicKey, setTopicKey] = useState(Object.keys(studyTopics)[0]);
  const [materialType, setMaterialType] = useState<StudyMaterialType>(StudyMaterialType.SUMMARY);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('ms');
  const initialLoadHandled = useRef(false);

  const t = (key: string) => translations[language]?.[key] || key;

  useEffect(() => {
    if (initialLoadHandled.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const topicKeyFromUrl = urlParams.get('topicKey');
    const typeFromUrl = urlParams.get('type') as StudyMaterialType;
    
    const isValidTopic = topicKeyFromUrl && Object.keys(studyTopics).includes(topicKeyFromUrl);
    const isValidType = Object.values(StudyMaterialType).includes(typeFromUrl);

    if (isValidTopic && isValidType) {
        initialLoadHandled.current = true;
        setTopicKey(topicKeyFromUrl);
        setMaterialType(typeFromUrl);
        
        const generateFromUrl = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const topicText = studyTopics[topicKeyFromUrl][language];
                const content = await generateStudyMaterial(topicText, typeFromUrl, language);
                setGeneratedContent(content);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        generateFromUrl();
    }
  }, [language]);

  const handleGenerate = useCallback(async () => {
    const topic = studyTopics[topicKey][language];
    if (!topic.trim()) {
      setError("Please select a topic.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const content = await generateStudyMaterial(topic, materialType, language);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topicKey, materialType, language]);
  
  const currentTopicText = studyTopics[topicKey][language];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header t={t} language={language} setLanguage={setLanguage}/>
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <aside className="lg:col-span-1">
             <div className="sticky top-28 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-lg space-y-8">
                {/* Topic Input */}
                <div className="space-y-2">
                    <label htmlFor="topic-select" className="block text-xl font-semibold text-slate-700 dark:text-slate-300">
                        {t('selectChapter')}
                    </label>
                    <div className="relative">
                      <select
                          id="topic-select"
                          value={topicKey}
                          onChange={(e) => setTopicKey(e.target.value)}
                          className="w-full appearance-none p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                          {Object.entries(studyTopics).map(([key, value]) => (
                              <option key={key} value={key}>{value[language]}</option>
                          ))}
                      </select>
                      <svg className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-3' : 'right-3'} pointer-events-none`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                
                {/* Material Type */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">{t('materialType')}</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <MaterialTypeButton type={StudyMaterialType.SUMMARY} currentType={materialType} onClick={setMaterialType} language={language}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {t('summary')}
                        </MaterialTypeButton>
                        <MaterialTypeButton type={StudyMaterialType.QUIZ} currentType={materialType} onClick={setMaterialType} language={language}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {t('quiz')}
                        </MaterialTypeButton>
                        <MaterialTypeButton type={StudyMaterialType.TIMELINE} currentType={materialType} onClick={setMaterialType} language={language}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {t('timeline')}
                        </MaterialTypeButton>
                        <MaterialTypeButton type={StudyMaterialType.FLASHCARDS} currentType={materialType} onClick={setMaterialType} language={language}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            {t('flashcards')}
                        </MaterialTypeButton>
                     </div>
                </div>

                {/* Generate Button */}
                <div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('generatingButton')}
                            </>
                        ) : (
                           <>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                            {t('createButton')}
                           </>
                        )}
                    </button>
                </div>
            </div>
          </aside>

          {/* Result Column */}
          <div className="lg:col-span-2 min-h-[60vh]">
            {isLoading && !generatedContent ? (
              <LoadingSpinner t={t} />
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">{t('errorTitle')}</p>
                <p>{error}</p>
              </div>
            ) : generatedContent ? (
              <ResultDisplay content={generatedContent} type={materialType} onRegenerate={handleGenerate} isRegenerating={isLoading} topic={currentTopicText} topicKey={topicKey} t={t} language={language}/>
            ) : (
                <WelcomeMessage t={t}/>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;