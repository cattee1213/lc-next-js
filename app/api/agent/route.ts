import { NextResponse } from 'next/server';
import AgentService from '@/app/lib/agent-service';

export const runtime = 'nodejs'; // 禁用 Edge，使用 Node 内置模块
export const dynamic = 'force-dynamic';

const agent = new AgentService();

export async function POST(req: Request) {
  try {
    const { prompt, threadId } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }
    const answer = await agent.ask(prompt, threadId);
    return NextResponse.json({ answer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
