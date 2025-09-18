import 'server-only';
import SiliconFlowChat from './silicon-flow-chat';

import { TavilySearch } from '@langchain/tavily';
import {
  MemorySaver,
  StateGraph,
  MessagesAnnotation
} from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

export default function CustomAgentService() {
  const tools = [
    new TavilySearch({
      tavilyApiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY,
      maxResults: 3
    })
  ];
  const toolNode = new ToolNode(tools);

  const model = new SiliconFlowChat('', false).bindTools(tools);

  // Define the function that determines whether to continue or not
  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return '__end__';
  }

  // Define the function that calls the model
  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', shouldContinue);

  const app = workflow.compile();

  async function ask(prompt: string) {
    const response = await app.invoke({ messages: [new HumanMessage(prompt)] });
    const answer = response.messages[response.messages.length - 1]?.content;
    return { answer };
  }

  async function getGhraphPng() {
    const gh = await app.getGraphAsync();
    const png = await gh.drawMermaidPng();
    const arrayBuffer = await png.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return { ask, getGhraphPng };
}
