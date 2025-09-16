'use client';

import AgentService from "../../lib/agent-service";
import React, { useState } from "react";
import Markdown from 'react-markdown'

export default function CustomLLMChat() {

  const [q, setQ] = useState<string>("");
  const [r, setR] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setR("");
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");
      setR(String(data.answer ?? ""));
    } catch (e: any) {
      setR(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
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
        >send</button>
        <div className="w-full  flex-1 border-1 border-gray-200 border-solid p-2 overflow-auto">
          <Markdown>
            {r}
          </Markdown>
        </div>
      </div>
    </main>
  );
}
