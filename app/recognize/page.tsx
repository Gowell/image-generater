'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ImageRecognition() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 处理图片上传
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setImageFile(file);
        setRecognitionResult(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // 识别图片
  const recognizeImage = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setError(null);
    setRecognitionResult(null);
    
    try {
      // 将图片转换为Base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          // 移除data:image/xxx;base64,前缀
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(imageFile);
      });

      // 获取图片格式
      const imageFormat = imageFile.name.split('.').pop()?.toLowerCase() || 'jpeg';
      
      // 调用我们的API路由（服务器端）
      const response = await fetch('/api/recognize-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: base64Data,
          imageFormat: imageFormat
        })
      });

      const data = await response.json();
      
      console.log('API响应状态:', response.status);
      console.log('API响应数据:', data);
      
      if (!response.ok) {
        // 更详细的错误信息显示
        const errorMessage = data.error || '图片识别失败';
        const errorDetails = data.details ? `\n详细信息: ${JSON.stringify(data.details)}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // 处理API响应 - 增加容错处理和模拟响应标识
      try {
        // 检查是否为模拟响应
        const isSimulated = data.isSimulated === true;
        
        if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
          const firstChoice = data.choices[0];
          if (firstChoice.message && firstChoice.message.content) {
            let content = firstChoice.message.content;
            
            // 如果是模拟响应，添加适当的视觉标识
            if (isSimulated) {
              content = `【模拟响应】\n${content}`;
            }
            
            setRecognitionResult(content);
          } else {
            setError('API返回了结果但内容为空');
            console.warn('API返回结果结构不完整:', data);
          }
        } else {
          // 尝试直接从data中提取content字段（可能的备用响应格式）
          if (data.content) {
            let content = data.content;
            
            // 如果是模拟响应，添加适当的视觉标识
            if (isSimulated) {
              content = `【模拟响应】\n${content}`;
            }
            
            setRecognitionResult(content);
          } else {
            setError('API返回格式不符合预期');
            console.warn('API返回格式不正确:', data);
          }
        }
      } catch (parseError) {
        console.error('解析API响应时出错:', parseError);
        setError('处理API响应时发生错误');
      }
    } catch (error) {
      console.error('识别图片时出错:', error);
      setError(error instanceof Error ? error.message : '识别图片失败，请稍后重试');
    } finally {
      setIsProcessing(false);
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600">
              图片识别工具
            </span>
          </h1>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 上传区域 */}
          <section className="mb-12">
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="bg-green-500 text-white p-3 rounded-full inline-block mb-4">
                <Image src="/globe.svg" alt="上传图片" width={32} height={32} className="filter brightness-0 invert" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                点击上传图片
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                支持 JPG、PNG、WebP 等常见图片格式
              </p>
            </div>
          </section>

          {/* 图片预览和处理区域 */}
          {image && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* 上传的图片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">上传的图片</h3>
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={image} 
                    alt="上传的图片" 
                    className="max-w-full max-h-[300px] object-contain" 
                  />
                </div>
                
                {/* 识别按钮 */}
                <button
                  onClick={recognizeImage}
                  disabled={isProcessing}
                  className={`mt-4 w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? '正在识别...' : '识别图片内容'}
                </button>
              </div>

              {/* 识别结果 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">识别结果</h3>
                
                {/* 加载状态 */}
                {isProcessing && (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                )}

                {/* 错误信息 */}
                {error && !isProcessing && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                  </div>
                )}

                {/* 识别结果 */}
                {recognitionResult && !isProcessing && (
                  <div className={`p-4 rounded-lg max-h-[300px] overflow-y-auto ${recognitionResult.includes('【模拟响应】') ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                    {recognitionResult.includes('【模拟响应】') && (
                      <div className="mb-3 px-3 py-2 bg-blue-100 dark:bg-blue-800/50 rounded-md">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">注意：</span>
                        <span className="text-blue-600 dark:text-blue-400">当前使用的是模拟响应，因为火山引擎API端点暂时不可用。</span>
                      </div>
                    )}
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {recognitionResult.replace('【模拟响应】\n', '')}
                    </p>
                  </div>
                )}

                {/* 无结果时的提示 */}
                {!isProcessing && !error && !recognitionResult && (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <Image src="/globe.svg" alt="识别图标" width={48} height={48} className="mb-4 opacity-50" />
                    <p>点击上方按钮开始识别图片内容</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 功能说明 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">功能说明</h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>上传图片后点击"识别图片内容"按钮，系统将自动分析图片内容</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>支持识别图片中的物体、文字、场景等内容</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>适用于内容审核、图像分类、场景理解等应用场景</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>识别质量取决于图片清晰度和内容复杂度</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} AI图片处理中心 - 图片识别工具</p>
        </div>
      </footer>
    </div>
  );
}