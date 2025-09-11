import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SILICONFLOW_API_KEY: 'sk-ksmomyhjwefawpcvchmjzmsuehebpyplujarssxipxixemtl',
    NEXT_PUBLIC_API_BASE_URL: 'https://api.siliconflow.cn/v1',
    NEXT_PUBLIC_API_MODEL: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
  }
};

export default nextConfig;
