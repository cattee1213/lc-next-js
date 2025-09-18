'use client';

import SiliconFlowChat from "../../lib/silicon-flow-chat";
import React, { useState } from "react";
import Markdown from 'react-markdown'
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export default function CustomLLMChat() {

  const [q, setQ] = useState("");
  const [r, setR] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    setR("");
    const llm = new SiliconFlowChat()

    const stream = await llm.stream([
      new HumanMessage(q)
    ]);
    for await (const chunk of stream) {
      if (chunk.content) {
        setR(r => r + chunk.content);
      }
    }
    setLoading(false);
  }

  return (
    <main className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-[600px] h-[600px] shadow border-1 border-gray-200 border-solid flex flex-col items-start justify-start p-4 gap-6 rounded-lg">
        <input
          className="w-full border-1 border-gray-200 border-solid p-2"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Enter your question here..."
        />
        <button
          onClick={fetchData}
          className="bg-indigo-400 text-white w-full rounded-md uppercase"
          disabled={loading}
        >
          {loading ? "Loading..." : "send"}
        </button>
        <div className="w-full  flex-1 border-1 border-gray-200 border-solid p-2 overflow-auto">
          <Markdown>{r}</Markdown>
        </div>
      </div>
    </main>
  );
}
