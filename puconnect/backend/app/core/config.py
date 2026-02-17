from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	DATABASE_URL: str
	SECRET_KEY: str
	ALGORITHM: str = "HS256"
	ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
	REFRESH_TOKEN_EXPIRE_DAYS: int = 7
	REDIS_URL: str
	MTN_MOMO_API_KEY: str
	ENVIRONMENT: str = "development"

	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8"
	)


@lru_cache()
def get_settings() -> Settings:
	return Settings()
