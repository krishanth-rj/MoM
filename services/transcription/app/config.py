import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    model_name: str = os.getenv("TRANSCRIPTION_MODEL", "small")
    device: str = os.getenv("TRANSCRIPTION_DEVICE", "cpu")
    compute_type: str = os.getenv("TRANSCRIPTION_COMPUTE_TYPE", "int8")


settings = Settings()
