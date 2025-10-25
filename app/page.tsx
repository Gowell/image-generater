import Image from "next/image";

export default function Home() {
  const features = [
    {
      id: "compress",
      title: "图片压缩",
      description: "减小图片文件大小，保持视觉质量",
      icon: "/file.svg",
      color: "bg-blue-500"
    },
    {
      id: "remove-bg",
      title: "抠图去背景",
      description: "智能识别主体，一键去除背景",
      icon: "/window.svg",
      color: "bg-purple-500"
    },
    {
      id: "recognize",
      title: "图片识别",
      description: "识别图片中的物体、文字和场景",
      icon: "/globe.svg",
      color: "bg-green-500"
    },
    {
      id: "generate",
      title: "AI 生图",
      description: "根据文字描述生成高质量图片",
      icon: "/image-icon.svg",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/75 dark:bg-gray-900/75 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              AI图片处理中心
            </span>
          </h1>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* 欢迎部分 */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            强大的图片处理工具集合
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            使用我们的AI工具，轻松完成图片压缩、抠图去背景、图片识别和AI生图等任务
          </p>
        </section>

        {/* 功能卡片 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" 
                   style={{ background: feature.color }}></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${feature.color} text-white`}>
                  <Image 
                    src={feature.icon} 
                    alt={feature.title} 
                    width={32} 
                    height={32} 
                    className="filter brightness-0 invert"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {feature.description}
                </p>
                
                {feature.id === 'compress' ? (
                  <a 
                    href="/compress"
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${feature.color} text-white hover:opacity-90`}
                  >
                    立即使用
                  </a>
                ) : (
                  <button 
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${feature.color} text-white hover:opacity-90`}
                  >
                    立即使用
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>AI图片处理中心 © {new Date().getFullYear()} | 强大、高效的图片处理解决方案</p>
        </div>
      </footer>
    </div>
  );
}
