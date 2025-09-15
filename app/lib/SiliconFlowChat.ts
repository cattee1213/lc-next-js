'use client';
import { ChatOpenAI } from '@langchain/openai'; // 借用 OpenAI 的结构
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { AIMessageChunk, type BaseMessage } from '@langchain/core/messages';
import { ChatGenerationChunk } from '@langchain/core/outputs';
// 自定义 SiliconFlow LLM
export default class SiliconFlowChat extends ChatOpenAI {
  constructor(model = '', streaming = true) {
    super({
      modelName: model || process.env.NEXT_PUBLIC_API_MODEL,
      apiKey: process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY, // 实际用作 SiliconFlow 的 key
      temperature: 0.7,
      configuration: {
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
      },
      streaming
    });
  }

  // 如果需要进一步自定义，可以重写 _generate 方法
  async _generate(messages: any[], options: any): Promise<any> {
    // 调用父类方法，它会使用配置的 URL 和 key
    return super._generate(messages, options);
  }
}
