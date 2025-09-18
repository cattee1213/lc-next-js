import { NextResponse } from 'next/server';
import AgentService from '@/app/lib/custom-agent-service';

export const runtime = 'nodejs';
const agent = AgentService();

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const { answer } = await agent.ask(prompt);
  return NextResponse.json({ answer });
}
