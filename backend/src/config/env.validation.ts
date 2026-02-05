import { IsEnum, IsPort, IsString, validateSync } from "class-validator";
import { plainToClass } from "class-transformer";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsPort()
  PORT: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  ALCHEMY_API_KEY: string;

  @IsString()
  CONTRACT_ADDRESS: string;

  @IsString()
  CHAIN_ID: string; // ex: "11155111" para Sepolia, "1" para mainnet
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
