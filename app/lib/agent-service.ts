import 'server-only';
import SiliconFlowChat from './silicon-flow-chat';

import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

export default class AgentService {
  private readonly agent: any;
  private readonly checkpointer = new MemorySaver();
  private readonly defaultThreadId: string;

  constructor(defaultThreadId = '42') {
    const tools = [new TavilySearchResults({ maxResults: 3, apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY })];
    const model = new SiliconFlowChat('', false);

    this.defaultThreadId = defaultThreadId;
    this.agent = createReactAgent({
      llm: model,
      tools,
      checkpointSaver: this.checkpointer,
      // 关键：使用 messageModifier（而不是 prompt）加强 ReAct 模式与工具名；输出为 Markdown
      messageModifier: [
        'You are a helpful assistant with access to tools.',
        'Always use the tool tavily_search_results_json to fetch up-to-date info before answering.',
        'Respond in GitHub-Flavored Markdown:',
        '- Use headings, bullet lists, and tables when helpful.',
        '- Use fenced code blocks with language tags for code.',
        '- Keep answers concise.',
        'Use ReAct format strictly:',
        'Thought: Do I need to use a tool? yes',
        'Action: tavily_search_results_json',
        'Action Input: {"query": "<the query to search>"}',
        'Observation: <tool result>',
        'Thought: <reason about the observation>',
        'Final Answer: <your final answer in Markdown with a Sources section>',
        'Sources:',
        '- [<title>](<url>)'
      ].join('\n')
    });
  }

  async ask(prompt: string, threadId?: string) {
    const handler = new (class extends BaseCallbackHandler {
      name = 'tavily-logger';
      async handleToolStart(tool: any, input: any) {
        console.log('[TOOL START]', tool?.name, input);
      }
      async handleToolEnd(output: any) {
        const out = typeof output === 'string' ? output : JSON.stringify(output);
        console.log('[TOOL END]', out.slice(0, 400));
      }
      async handleToolError(err: Error) {
        console.error('[TOOL ERROR]', err?.message ?? String(err));
      }
      async handleLLMEnd(output: any) {
        try {
          const txt = output?.generations?.[0]?.[0]?.text ?? output?.generations?.[0]?.[0]?.message?.content ?? '';
          if (txt) console.log('[LLM OUTPUT]', String(txt).slice(0, 800));
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
    return res.messages[res.messages.length - 1]?.content;
  }
}
