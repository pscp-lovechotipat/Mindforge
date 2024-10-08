/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable Cloudflare's next-on-pages
    experimental: {
        enableUndici: true,
    },
    // Add Cloudflare-specific headers
    headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
