import { betterAuth } from "better-auth";

export const auth = betterAuth({
    database: {
        provider: "postgresql",
        url: process.env.DATABASE_URL!,
    },
    secret: process.env.BETTER_AUTH_SECRET || "fallback-dev-secret-change-in-production",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    // Other configuration options
});