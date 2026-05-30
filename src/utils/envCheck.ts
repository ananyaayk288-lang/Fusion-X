const REQUIRED_SECRETS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const RECOMMENDED_SECRETS = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
    'DAILY_SALT'
];

/**
 * Validates that all critical infrastructure secrets are present.
 * Throws an error for required keys, and logs warnings for optional/recommended ones.
 */
export function checkRequiredSecrets() {
    const missingRequired = REQUIRED_SECRETS.filter(secret => !process.env[secret]);
    if (missingRequired.length > 0) {
        throw new Error(
            `[CRITICAL BOOTSTRAP FAILURE] Missing environment secrets: ${missingRequired.join(', ')}. ` +
            `Please configure these keys in your local .env file immediately.`
        );
    }

    const missingRecommended = RECOMMENDED_SECRETS.filter(secret => !process.env[secret]);
    if (missingRecommended.length > 0) {
        console.warn(
            `[SECURITY WARNING] Missing recommended environment secrets: ${missingRecommended.join(', ')}. ` +
            `Some advanced administrative/security features may be unavailable.`
        );
    }
}
