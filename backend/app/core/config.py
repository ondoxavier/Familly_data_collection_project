from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Family Data Collection API"
    APP_ENV: str = "dev"
    DATABASE_URL: str
    SECRET_KEY: str = "change-this-secret-key"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
