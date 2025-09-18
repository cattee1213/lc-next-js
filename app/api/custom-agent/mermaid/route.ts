import AgentService from '@/app/lib/custom-agent-service';

export const runtime = 'nodejs';
const agent = AgentService();

export async function GET(req: Request) {
  const png = await agent.getGhraphPng(); // 返回 ArrayBuffer/Uint8Array/Buffer 均可
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename') ?? 'graph.png';

  return new Response(png as any, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST(req: Request) {
  // 与 GET 行为一致，便于兼容
  return GET(req);
}
