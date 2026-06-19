import uuid

def generate_filename(original_filename: str) -> str:
    ext = original_filename.split(".")[-1] if "." in original_filename else "bin"
    return f"{uuid.uuid4().hex}.{ext}"