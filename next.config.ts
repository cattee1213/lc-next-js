import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SILICONFLOW_API_KEY: 'sk-ksmomyhjwefawpcvchmjzmsuehebpyplujarssxipxixemtl',
    NEXT_PUBLIC_API_BASE_URL: 'https://api.siliconflow.cn/v1',
    NEXT_PUBLIC_API_MODEL: 'Qwen/Qwen3-8B',
    NEXT_PUBLIC_TAVILY_API_KEY: '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'
  }
};

export default nextConfig;
