'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RemoveBackground() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
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
        setProcessedImage(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // 去除背景
  const removeBackground = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // 由于浏览器端JavaScript的安全限制，我们无法直接发送带有API密钥的请求
      // 这里我们模拟API调用，实际项目中应该通过服务器端代理请求
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-API-Key': 'Sozv9muEq7k2DBnPA3hEuJrL',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`);
      }

      // 处理响应
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
    } catch (error) {
      console.error('去除背景时出错:', error);
      setError('去除背景失败，请稍后重试。如果问题持续，请检查图片格式或大小。');
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载去除背景的图片
  const downloadProcessedImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              抠图去背景工具
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
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="bg-purple-500 text-white p-3 rounded-full inline-block mb-4">
                <Image src="/window.svg" alt="上传图片" width={32} height={32} className="filter brightness-0 invert" />
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
              {/* 原始图片 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">原始图片</h3>
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={image} 
                    alt="原始图片" 
                    className="max-w-full max-h-[300px] object-contain" 
                  />
                </div>
              </div>

              {/* 处理设置和处理后预览 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">处理设置</h3>
                
                {/* 去除背景按钮 */}
                <button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-300 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? '正在处理...' : '去除背景'}
                </button>

                {/* 错误信息显示 */}
                {error && (
                  <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                  </div>
                )}

                {/* 处理后图片预览 */}
                {processedImage && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">去除背景后</h3>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                      <img 
                        src={processedImage} 
                        alt="去除背景后图片" 
                        className="max-w-full max-h-[200px] object-contain" 
                      />
                    </div>
                    <button
                      onClick={downloadProcessedImage}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      保存图片
                    </button>
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
                <span className="text-purple-500 mr-2">✓</span>
                <span>上传图片后点击"去除背景"按钮，系统将自动识别主体并去除背景</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>处理后的图片将以 PNG 格式保存，保留透明背景</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>适用于产品展示、证件照片处理、社交媒体图片编辑等场景</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>处理质量取决于图片清晰度和主体与背景的对比度</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} AI图片处理中心 - 抠图去背景工具</p>
        </div>
      </footer>
    </div>
  );
}