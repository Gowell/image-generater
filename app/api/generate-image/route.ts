import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    console.log('接收到的AI生图请求:', JSON.stringify(body));
    console.log('请求参数类型:', { prompt: typeof body.prompt, model: typeof body.model });
    
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('缺少有效的提示词');
      return NextResponse.json(
        { error: '请输入有效的提示词' },
        { status: 400 }
      );
    }

    // 从环境变量获取API密钥
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error('API密钥未设置');
      return NextResponse.json(
        { error: '服务器配置错误，API密钥未设置' },
        { status: 500 }
      );
    }
    console.log('API密钥已获取');

    // 构建请求数据
    const requestBody = {
      model: "ep-20251028173230-vq69v",
      prompt: prompt,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false,
      watermark: true
    };

    console.log('准备调用火山引擎图片生成API，请求体:', JSON.stringify(requestBody));
    console.log('API端点:', 'https://ark.cn-beijing.volces.com/api/v3/images/generations');
    
    try {
      // 调用火山引擎API
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('图片生成API响应状态:', response.status);
      console.log('API原始响应数据:', JSON.stringify(data));
      console.log('API响应数据结构:', JSON.stringify(Object.keys(data)));
      
      if (!response.ok) {
        console.log('API调用失败，错误信息:', data.error?.message);
        
        // 如果API返回认证错误或端点错误，使用模拟响应
        if (data.error?.code === 'AuthenticationError' || 
            data.error?.code === 'InvalidEndpoint.ClosedEndpoint') {
          // 返回模拟响应
          return NextResponse.json({
            data: {
              url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YWklMjBpbWFnZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              alt_text: "AI生成的示例图片"
            },
            isSimulated: true,
            apiStatus: data.error?.code
          });
        }
        
        return NextResponse.json(
          { 
            error: data.error?.message || '图片生成失败',
            status: response.status,
            details: data.error
          },
          { status: response.status }
        );
      }

      // 确保返回格式符合前端期望
      let responseToReturn;
      
      // 情况1：data是对象且有url属性
      if (data.data && typeof data.data === 'object' && data.data.url) {
        responseToReturn = data;
        console.log('使用原始响应格式（data.data.url）');
      } 
      // 情况2：data是数组格式
      else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // 如果API返回的data是数组格式
        responseToReturn = {
          data: {
            url: data.data[0].url || data.data[0].b64_json
          }
        };
        console.log('使用data数组格式转换');
      }
      // 情况3：images数组格式
      else if (data.images && data.images.length > 0) {
        // 如果API返回的是images数组格式
        responseToReturn = {
          data: {
            url: data.images[0].url || data.images[0].b64_json
          }
        };
        console.log('使用images数组格式转换');
      } 
      // 情况4：备用格式
      else {
        // 转换其他格式以符合前端期望
        responseToReturn = {
          data: {
            url: data.url || data.image_url || data.result
          }
        };
        console.log('使用备用格式转换');
      }
      
      console.log('最终返回给前端的格式:', JSON.stringify(responseToReturn));
      return NextResponse.json(responseToReturn);
    } catch (apiError) {
      console.error('图片生成API请求异常:', apiError);
      // 网络错误或其他异常时返回模拟响应
      return NextResponse.json({
        data: {
          url: "https://images.unsplash.com/photo-1635070048854-f21724e3a405?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8YWklMjBpbWFnZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
          alt_text: "AI生成的示例图片"
        },
        isSimulated: true,
        apiStatus: 'network_error'
      });
    }
  } catch (error) {
    console.error('图片生成处理错误:', error);
    return NextResponse.json(
      { 
        error: '处理请求时发生错误',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}