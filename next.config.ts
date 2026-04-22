import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── BasePath : l'app est servie sous videobourse.fr/comparatif via Cloudflare Worker
  basePath: '/comparatif',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'api.faviconkit.com' },
    ]
  },
  transpilePackages: ['geist'],

  // ── Désindexer l'ancien sous-domaine Vercel pour éviter le contenu dupliqué.
  // Cloudflare Worker supprimera ce header avant de renvoyer la réponse
  // depuis videobourse.fr/comparatif — seul ce dernier sera indexé par Google.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        // LP = page tous les acteurs (plus de landing Framer)
        source: '/',
        destination: '/dashboard/courtiers',
      },
    ];
  },
};

export default nextConfig;