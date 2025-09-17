import 'server-only';
import SiliconFlowChat from './silicon-flow-chat';

import { TavilySearch } from '@langchain/tavily';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

// 定义事件类型（可选）
export type AgentEvent =
  | { type: 'toolStart'; name: string; input: any }
  | { type: 'toolEnd'; name: string; output: any }
  | { type: 'toolError'; name: string; error: string }
  | { type: 'llmOutput'; text: string };

export default class AgentService {
  private readonly agent: any;
  private readonly checkpointer = new MemorySaver();
  private readonly defaultThreadId: string;

  constructor(defaultThreadId = '42') {
    const tools = [
      new TavilySearch({
        maxResults: 3,
        tavilyApiKey: process.env.TAVILY_API_KEY || process.env.NEXT_PUBLIC_TAVILY_API_KEY
      })
    ];
    const model = new SiliconFlowChat('', false);

    this.defaultThreadId = defaultThreadId;
    this.agent = createReactAgent({
      llm: model,
      tools,
      checkpointSaver: this.checkpointer
    });
  }

  /**
   * @param prompt 用户问题
   * @param threadId 线程ID
   * @param onEvent 实时事件回调（可在外层推送到前端）
   */
  async ask(
    prompt: string,
    threadId?: string,
    onEvent?: (e: AgentEvent) => void
  ): Promise<{ answer: any; events: AgentEvent[] }> {
    const events: AgentEvent[] = [];

    const emit = (e: AgentEvent) => {
      events.push(e);
      onEvent?.(e);
    };

    const handler = new (class extends BaseCallbackHandler {
      name = 'agent-logger';

      private extractToolName(tool: any) {
        if (!tool) return 'unknown_tool';
        return (
          tool.name ||
          tool.kwargs?.name ||
          (Array.isArray(tool.id) ? tool.id[tool.id.length - 1] : undefined) ||
          tool.constructor?.name ||
          'unknown_tool'
        );
      }

      async handleToolStart(tool: any, input: any) {
        const name = this.extractToolName(tool);
        console.log('[TOOL START]', name, input);
        emit({ type: 'toolStart', name, input });
      }
      async handleToolEnd(output: any, tool?: any) {
        const name = this.extractToolName(tool);
        const out = typeof output === 'string' ? output : JSON.stringify(output);
        console.log('[TOOL END]', name, out.slice(0, 400));
        emit({ type: 'toolEnd', name, output });
      }
      async handleToolError(err: Error, tool?: any) {
        const name = this.extractToolName(tool);
        console.error('[TOOL ERROR]', name, err.message);
        emit({ type: 'toolError', name, error: err.message });
      }

      async onToolStart(tool: any, input: any) {
        return this.handleToolStart(tool, input);
      }
      async onToolEnd(output: any, tool?: any) {
        return this.handleToolEnd(output, tool);
      }
      async onToolError(err: Error, tool?: any) {
        return this.handleToolError(err, tool);
      }

      async handleLLMEnd(output: any) {
        try {
          const txt = output?.generations?.[0]?.[0]?.text ?? output?.generations?.[0]?.[0]?.message?.content ?? '';
          if (txt) {
            console.log('[LLM OUTPUT]', txt.slice(0, 400));
            emit({ type: 'llmOutput', text: txt });
          }
        } catch {}
      }
    })();

    const res = await this.agent.invoke(
      { messages: [new HumanMessage(prompt)] },
      {
        configurable: { thread_id: threadId ?? this.defaultThreadId },
        callbacks: [handler]
      }
    );

    const answer = res.messages[res.messages.length - 1]?.content;
    return { answer, events };
  }
}
