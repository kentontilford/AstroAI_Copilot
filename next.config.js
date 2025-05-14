/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  
  // Enable TypeScript path aliases (@/component/...)
  experimental: {
    appDir: true,
  },
  
  // Use standalone output for containerized deployment
  output: 'standalone',
  
  images: {
    domains: [
      'images.clerk.dev', // For Clerk user images
      'img.clerk.com'     // For Clerk user images
    ],
    // Set reasonable image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Add Content Security Policy in production
  headers: async () => {
    // Get the app domain from environment or use a default
    const appDomain = (process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com')
      .replace('https://', '')
      .replace('http://', '');
      
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Add Content-Security-Policy in production to secure the app
          process.env.NODE_ENV === 'production' ? 
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://*.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://img.clerk.com https://images.clerk.dev;
              font-src 'self';
              connect-src 'self' https://api.openai.com https://api.stripe.com https://*.clerk.accounts.dev https://maps.googleapis.com;
              frame-src 'self' https://js.stripe.com;
              object-src 'none';
            `.replace(/\s{2,}/g, ' ').trim()
          } : 
          {
            key: 'Content-Security-Policy-Report-Only',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://*.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://img.clerk.com https://images.clerk.dev;
              font-src 'self';
              connect-src 'self' https://api.openai.com https://api.stripe.com https://*.clerk.accounts.dev https://maps.googleapis.com;
              frame-src 'self' https://js.stripe.com;
              object-src 'none';
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
  
  // Handle redirects
  redirects: async () => {
    return [
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
    ]
  },
  
  // Configure webpack as needed
  webpack: (config, { dev, isServer }) => {
    // Only run bundle analyzer in build mode
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: 8888,
        openAnalyzer: true
      }))
    }
    
    // Handle swisseph WASM files
    config.experiments = { 
      ...config.experiments,
      asyncWebAssembly: true 
    }
    
    // Optimize production builds
    if (!dev && !isServer) {
      // Split chunks more effectively
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
          },
        },
      };
    }
    
    return config
  },

  // Run after build
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig