/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns: [
            {
                hostname:"avatars.githubusercontent.com",
            },
            {
                hostname:"imagedelivery.net",
            },
            {
                hostname:"watch.videodelivery.net",
            },
            {
                hostname:"customer-vyasxofdc5hmar68.cloudflarestream.com",
            }
        ]
        
    },
    env: {
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    }
};

export default nextConfig;
