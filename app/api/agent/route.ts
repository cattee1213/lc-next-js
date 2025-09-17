import { NextResponse } from 'next/server';
import AgentService from '@/app/lib/agent-service';

export const runtime = 'nodejs';
const agent = new AgentService();

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { answer, events } = await agent.ask(prompt);
  return NextResponse.json({ answer, events });
}
