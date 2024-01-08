import "dotenv/config";

interface envSchema {
  readonly TG_BOT_TOKEN: string;
}

export const env: any = process.env;
