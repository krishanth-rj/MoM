from faster_whisper import WhisperModel

from app.config import settings

_model: WhisperModel | None = None


def load_model() -> WhisperModel:
    global _model

    if _model is None:
        _model = WhisperModel(
            settings.model_name,
            device=settings.device,
            compute_type=settings.compute_type,
        )

    return _model


def get_model() -> WhisperModel:
    if _model is None:
        return load_model()

    return _model
