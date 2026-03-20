type EnvConfig = {
  apiBaseUrl: string;
};

const envConfig: EnvConfig = {
  apiBaseUrl:
    (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? 'http://localhost:5000/api',
};

export const getEnvConfig = (): EnvConfig => envConfig;
