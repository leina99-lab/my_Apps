import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Rocket, Target, ChevronRight, Lock, Unlock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import Markdown from 'react-markdown';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type AppState = 'landing' | 'form' | 'analyzing' | 'result';

interface AnalysisResult {
  summary: string;
  strengths: string[];
  recommendedBusiness: {
    title: string;
    description: string;
    why: string;
  }[];
  detailedRoadmap: string; // Markdown content
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [formData, setFormData] = useState({
    lifeStory: '',
    skills: '',
    interests: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleStart = () => setAppState('form');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lifeStory || !formData.skills) {
      setError('과거 이력과 현재 보유 기술을 입력해주세요.');
      return;
    }
    setError('');
    setAppState('analyzing');

    try {
      const prompt = `
        당신은 세계 최고의 '잠재력 진단 및 커리어/비즈니스 설계 AI 아키텍트'입니다.
        사용자의 과거 이력, 보유 기술, 관심사를 분석하여 숨겨진 강점을 찾아내고, 
        가장 성공 확률이 높은 비즈니스 모델이나 커리어 업스킬링 방향을 제안해야 합니다.

        사용자 정보:
        - 과거 이력 (Life Story): ${formData.lifeStory}
        - 보유 기술: ${formData.skills}
        - 관심사: ${formData.interests}

        다음 JSON 형식으로 응답해주세요:
        {
          "summary": "사용자의 잠재력에 대한 2-3문장 요약",
          "strengths": ["강점 1", "강점 2", "강점 3"],
          "recommendedBusiness": [
            {
              "title": "추천 비즈니스/커리어 모델 이름",
              "description": "어떤 일을 하는 것인지 간략한 설명",
              "why": "왜 이 사용자에게 적합한지 이유"
            }
          ],
          "detailedRoadmap": "마크다운 형식의 상세 실행 로드맵 (1단계, 2단계, 3단계 등 구체적인 액션 플랜 포함. 분량은 500자 이상)"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendedBusiness: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ['title', 'description', 'why']
                }
              },
              detailedRoadmap: { type: Type.STRING }
            },
            required: ['summary', 'strengths', 'recommendedBusiness', 'detailedRoadmap']
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (jsonStr) {
        const parsedResult = JSON.parse(jsonStr) as AnalysisResult;
        setResult(parsedResult);
        setAppState('result');
      } else {
        throw new Error('응답을 파싱할 수 없습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setAppState('form');
    }
  };

  const handleUnlock = () => {
    // Simulate payment process
    alert('결제가 완료되었습니다! (시뮬레이션)');
    setIsUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-950 cursor-pointer"
            onClick={() => { setAppState('landing'); setResult(null); setIsUnlocked(false); }}
          >
            <Brain className="w-6 h-6 text-indigo-600" />
            <span>Insight<span className="text-indigo-600">AI</span></span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">서비스 소개</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">성공 사례</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">요금제</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {appState === 'landing' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-12"
          >
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                <Sparkles className="w-4 h-4" />
                <span>AI 기반 잠재력 진단 SaaS</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                당신의 과거 경험이 <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  가장 강력한 비즈니스 무기
                </span>가 됩니다
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                과거 이력(Life Story)을 입력하면 AI가 당신의 숨겨진 강점을 분석하여,
                몸값을 2배로 높일 수 있는 최적의 커리어 로드맵과 비즈니스 모델을 설계해 드립니다.
              </p>
              <div className="pt-4">
                <button 
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
                >
                  무료로 내 잠재력 진단하기
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 w-full pt-12 border-t border-slate-200">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">메타러닝 아키텍트</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  단순한 공부법이 아닌, 당신의 성향을 분석해 어떤 지식이든 빠르게 흡수하는 최적화된 학습 시스템을 설계합니다.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">업스킬링 큐레이터</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  과거 이력에 숨겨진 강점을 찾아내고, 어떤 기술을 추가하면 커리어 가치가 극대화될지 로드맵을 짜드립니다.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-6 text-violet-600">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI 잠재력 진단</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  당신이 가진 통찰력을 알고리즘으로 분석하여, 가장 성공 확률이 높은 비즈니스 모델 결과지를 자동 생성합니다.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {appState === 'form' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">당신의 이야기를 들려주세요</h2>
                <p className="text-slate-600">AI가 당신의 경험 속에 숨겨진 성공 패턴을 찾아냅니다.</p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    과거 이력 (Life Story) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">어떤 일들을 해오셨나요? 성공, 실패, 특별한 경험 등 자유롭게 적어주세요.</p>
                  <textarea 
                    value={formData.lifeStory}
                    onChange={(e) => setFormData({...formData, lifeStory: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px] resize-y"
                    placeholder="예: 5년간 마케팅 에이전시에서 일하며 다양한 브랜드 캠페인을 기획했습니다. 최근에는 퇴사 후 작은 온라인 쇼핑몰을 운영해봤지만..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    현재 보유 기술 (Skills) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">할 줄 아는 것, 남들보다 조금 더 잘하는 것을 모두 적어주세요.</p>
                  <textarea 
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px] resize-y"
                    placeholder="예: 퍼포먼스 마케팅, 데이터 분석(GA4), 간단한 파이썬 스크립트 작성, 글쓰기, 사람들과 소통하기..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">
                    관심사 및 목표 (Interests)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">요즘 관심 있는 분야나 앞으로 이루고 싶은 목표가 있다면 적어주세요.</p>
                  <textarea 
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px] resize-y"
                    placeholder="예: AI 툴을 활용한 자동화에 관심이 많습니다. 월 1000만원의 자동화 수익을 만드는 것이 목표입니다."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                  <Sparkles className="w-5 h-5" />
                  AI 잠재력 진단 시작하기
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {appState === 'analyzing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Brain className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">당신의 잠재력을 분석하고 있습니다</h3>
              <p className="text-slate-500">수만 건의 성공 사례 데이터를 기반으로 최적의 로드맵을 설계 중입니다...</p>
            </div>
          </motion.div>
        )}

        {appState === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Summary Section (Free) */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 mb-6">
                <CheckCircle2 className="w-4 h-4" />
                <span>진단 완료</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">진단 결과 요약</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {result.summary}
              </p>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  발견된 핵심 강점
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.strengths.map((strength, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-600" />
                  추천 비즈니스 / 커리어 모델
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.recommendedBusiness.map((biz, idx) => (
                    <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-300 transition-colors">
                      <h4 className="font-bold text-slate-900 mb-2">{biz.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{biz.description}</p>
                      <div className="text-xs font-medium text-indigo-600 bg-indigo-50 p-3 rounded-xl">
                        <span className="block mb-1 text-indigo-800 font-bold">추천 이유:</span>
                        {biz.why}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Roadmap Section (Paid/Locked) */}
            <div className="relative">
              {!isUnlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">상세 실행 로드맵 잠금 해제</h3>
                    <p className="text-slate-600 mb-8">
                      당신의 강점을 수익으로 연결할 구체적인 1:1 맞춤형 액션 플랜을 확인하세요.
                    </p>
                    <button 
                      onClick={handleUnlock}
                      className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <Unlock className="w-5 h-5" />
                      9,900원 결제하고 전체 보기
                    </button>
                    <p className="text-xs text-slate-400 mt-4">
                      * 본 결제는 데모 시뮬레이션입니다. 실제 과금되지 않습니다.
                    </p>
                  </div>
                </div>
              )}

              <div className={`bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 ${!isUnlocked ? 'h-[400px] overflow-hidden' : ''}`}>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  맞춤형 상세 실행 로드맵
                </h2>
                <div className="prose prose-slate prose-indigo max-w-none">
                  <div className="markdown-body">
                    <Markdown>{result.detailedRoadmap}</Markdown>
                  </div>
                </div>
              </div>
            </div>
            
            {isUnlocked && (
               <div className="flex justify-center pt-8">
                 <button 
                   onClick={() => { setAppState('form'); setResult(null); setIsUnlocked(false); setFormData({lifeStory: '', skills: '', interests: ''}); }}
                   className="text-slate-500 hover:text-slate-900 font-medium underline underline-offset-4"
                 >
                   새로운 진단 시작하기
                 </button>
               </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
