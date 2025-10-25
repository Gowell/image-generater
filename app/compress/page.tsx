'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
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
        setCompressedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // 压缩图片
  const compressImage = async () => {
    if (!image) return;

    setIsCompressing(true);
    try {
      const compressed = await new Promise<string>((resolve) => {
        // 创建Image对象的正确方式
        const img = document.createElement('img');
        img.src = image;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 设置画布尺寸，保持原始比例
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          
          // 使用toDataURL进行压缩，quality参数控制压缩质量
          const compressedDataUrl = canvas.toDataURL('image/jpeg', compressionLevel / 100);
          resolve(compressedDataUrl);
        };
      });
      
      setCompressedImage(compressed);
    } catch (error) {
      console.error('压缩图片时出错:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  // 下载压缩后的图片
  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_image_${Date.now()}.jpg`;
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              图片压缩工具
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
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="bg-blue-500 text-white p-3 rounded-full inline-block mb-4">
                <Image src="/file.svg" alt="上传图片" width={32} height={32} className="filter brightness-0 invert" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                点击上传图片
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                支持 JPG、PNG、WebP 等常见图片格式
              </p>
            </div>
          </section>

          {/* 图片预览和压缩设置 */}
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

              {/* 压缩设置和压缩后预览 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">压缩设置</h3>
                
                {/* 压缩级别滑块 */}
                <div className="mb-6">
                  <label htmlFor="compression-level" className="block text-gray-700 dark:text-gray-300 mb-2">
                    压缩质量: {compressionLevel}%
                  </label>
                  <input
                    type="range"
                    id="compression-level"
                    min="10"
                    max="100"
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* 压缩按钮 */}
                <button
                  onClick={compressImage}
                  disabled={isCompressing}
                  className={`w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 ${isCompressing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isCompressing ? '正在压缩...' : '压缩图片'}
                </button>

                {/* 压缩后图片预览 */}
                {compressedImage && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">压缩后图片</h3>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                      <img 
                        src={compressedImage} 
                        alt="压缩后图片" 
                        className="max-w-full max-h-[200px] object-contain" 
                      />
                    </div>
                    <button
                      onClick={downloadCompressedImage}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      保存压缩图片
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
                <span className="text-blue-500 mr-2">✓</span>
                <span>上传图片后可以调整压缩质量百分比，数值越低压缩率越高</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>压缩后的图片将以 JPEG 格式保存，保持原始尺寸</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>所有处理在浏览器中完成，不会上传到服务器</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>适用于需要减小图片文件大小的场景，如网页优化、节省存储空间等</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} AI图片处理中心 - 图片压缩工具</p>
        </div>
      </footer>
    </div>
  );
}