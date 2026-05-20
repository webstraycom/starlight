/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://webstray.com',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
