import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    console.log('接收到的请求体:', JSON.stringify(Object.keys(body)));
    
    const { imageData, imageFormat } = body;
    
    if (!imageData || typeof imageData !== 'string') {
      console.error('缺少有效的图片数据');
      return NextResponse.json(
        { error: '缺少有效的图片数据' },
        { status: 400 }
      );
    }
    
    if (!imageFormat || typeof imageFormat !== 'string') {
      console.error('缺少有效的图片格式');
      return NextResponse.json(
        { error: '缺少有效的图片格式' },
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
      model: "ep-20251027102231-jv69q",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "详细描述这张图片中的内容"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageFormat.toLowerCase()};base64,${imageData}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    console.log('准备调用火山引擎API');
    
    try {
      // 调用火山引擎API
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        console.log('API调用失败，使用模拟响应');
        // 如果API返回端点关闭错误，使用模拟响应
        if (data.error?.code === 'InvalidEndpoint.ClosedEndpoint') {
          // 返回模拟响应
          return NextResponse.json({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "[模拟识别结果] 由于火山引擎API端点暂时不可用，这是一个模拟的图片识别结果。\n\n在正常情况下，系统会分析图片并提供详细描述。识别内容通常包括：\n- 图片中的主要物体和场景\n- 颜色和纹理特征\n- 物体之间的空间关系\n- 可能的情感或氛围\n\n请稍后再试，或者尝试使用其他图片进行识别。"
                }
              }
            ],
            usage: {
              prompt_tokens: 100,
              completion_tokens: 150,
              total_tokens: 250
            },
            isSimulated: true,
            apiStatus: 'temporarily_unavailable'
          });
        }
        
        return NextResponse.json(
          { 
            error: data.error?.message || 'API调用失败',
            status: response.status,
            details: data.error
          },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (apiError) {
      console.error('API请求异常:', apiError);
      // 网络错误或其他异常时也返回模拟响应
      return NextResponse.json({
        choices: [
          {
            message: {
              role: "assistant",
              content: "[模拟识别结果] 由于网络问题或API暂时不可用，这是一个模拟的图片识别结果。\n\n系统通常能够识别图片中的各种元素，如人物、物体、场景、文字等。识别质量取决于图片的清晰度和内容的复杂性。\n\n建议：\n- 确保图片清晰可见\n- 避免过于复杂或模糊的场景\n- 稍后再试，服务可能很快恢复\n- 尝试使用其他格式的图片"
            }
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250
        },
        isSimulated: true,
        apiStatus: 'network_error'
      });
    }
  } catch (error) {
    console.error('图片识别处理错误:', error);
    return NextResponse.json(
      { 
        error: '处理请求时发生错误',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}