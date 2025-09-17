'use client';
import React, { useState } from "react";
const key = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
const apiModel = process.env.NEXT_PUBLIC_API_MODEL

export default function SimpleChat() {

  const [q, setQ] = useState("");
  const [r, setR] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    setR("");
    const url = `${apiBaseUrl}/chat/completions`;
    if (!key) {
      setR("API KEY 未配置");
      setLoading(false);
      return;
    }
    const body = { "model": apiModel, "messages": [{ "role": "user", "content": q }], "stream": true };
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    try {
      const response = await fetch(url, options);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.slice(6);
              if (json === "[DONE]") continue;
              try {
                const obj = JSON.parse(json);
                const delta = obj.choices?.[0]?.delta;
                const content = delta?.content ?? delta?.reasoning_content ?? "";
                if (content) setR(r => r + content);
              } catch { }
            }
          }
        }
      }
    } catch (error) {
      setR("请求失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-[600px] h-[600px] shadow border-1 border-gray-200 border-solid flex flex-col items-start justify-start p-4 gap-6 rounded-lg">
        <textarea
          className="w-full h-1/2 border-1 border-gray-200 border-solid p-2"
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
        <div className="w-full h-1/2 border-1 border-gray-200 border-solid p-2 overflow-auto">
          {r}
        </div>
      </div>
    </main>
  );
}
