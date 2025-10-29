'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // 生成图片
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setIsSimulated(false);
    
    try {
      // 调用服务器端API
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      console.log('生成图片API响应:', data);
      
      if (!response.ok) {
        throw new Error(data.error || '图片生成失败');
      }

      // 检查是否为模拟响应
      if (data.isSimulated) {
        setIsSimulated(true);
      }

      // 处理API响应
      if (data.data && data.data.url) {
        setGeneratedImage(data.data.url);
      } else {
        setError('API返回格式不正确');
      }
    } catch (error) {
      console.error('生成图片时出错:', error);
      setError(error instanceof Error ? error.message : '生成图片失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制示例提示词
  const copyExamplePrompt = () => {
    const examplePrompt = "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc 渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影，强引力，吞噬";
    setPrompt(examplePrompt);
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  // 清除输入和结果
  const clearAll = () => {
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
    setIsSimulated(false);
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/75 dark:bg-gray-900/75 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
              AI 图片生成
            </span>
          </h1>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 提示词输入区域 */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  输入提示词
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={copyExamplePrompt}
                    className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                  >
                    示例提示词
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入详细的图片描述提示词，越详细生成的图片越符合预期..."
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-900 dark:text-white resize-none transition-all"
              />
              
              {/* 生成按钮 */}
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className={`mt-4 w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center ${isGenerating || !prompt.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>正在生成图片...</span>
                  </>
                ) : (
                  '生成图片'
                )}
              </button>
            </div>
          </section>

          {/* 结果展示区域 */}
          {error && !isGenerating && (
            <section className="mb-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">生成失败</h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </section>
          )}

          {generatedImage && !isGenerating && (
            <section className="mb-12">
              <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${isSimulated ? 'border-2 border-blue-300 dark:border-blue-700' : ''}`}>
                {isSimulated && (
                  <div className="mb-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">注意：</span>
                    <span className="text-blue-600 dark:text-blue-400">当前显示的是示例图片，因为火山引擎API暂时不可用。</span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">生成结果</h3>
                <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[400px]">
                  <img 
                    src={generatedImage} 
                    alt="AI生成的图片" 
                    className="max-w-full max-h-[400px] object-contain rounded-md shadow-sm" 
                    loading="lazy"
                  />
                </div>
                
                {/* 下载按钮 */}
                <div className="mt-4 flex justify-center">
                  <a
                    href={generatedImage}
                    download={`ai-generated-${Date.now()}.jpg`}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors inline-flex items-center"
                  >
                    <span className="flex items-center justify-center w-4 h-4 mr-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 14l-5-5h3V2h4v7h3l-5 5z"/>
                      </svg>
                    </span>
                    下载图片
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* 功能说明 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">使用说明</h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-medium text-lg mb-2">提示词技巧：</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>越详细的提示词生成的图片越符合预期</li>
                  <li>可以指定风格、色彩、构图、光线等细节</li>
                  <li>可以参考示例提示词的格式和细节描述</li>
                  <li>关键词之间用逗号分隔，主次分明</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-lg mb-2">生成须知：</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>图片生成可能需要几秒钟时间，请耐心等待</li>
                  <li>生成的图片尺寸为2K高清分辨率</li>
                  <li>系统会自动为生成的图片添加水印</li>
                  <li>如遇API限制，系统会显示示例图片</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} AI图片处理中心 - AI图片生成工具</p>
        </div>
      </footer>
    </div>
  );
}