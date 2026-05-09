from fastapi import UploadFile
from PIL import Image
from pathlib import Path
import os


BASE_UPLOAD_DIR = Path("uploads")


async def save_image(
    file: UploadFile,
    folder: str,
    filename: str,
    quality: int = 80,
    width: int | None = None,
    height: int | None = None,
) -> str:

    # create folder
    upload_dir = BASE_UPLOAD_DIR / folder
    upload_dir.mkdir(parents=True, exist_ok=True)

    # final filename
    final_filename = f"{filename.replace(' ', '_')}.webp"

    # full path
    file_path = upload_dir / final_filename

    # delete old image if exists
    if file_path.exists():
        os.remove(file_path)

    # open image
    image = Image.open(file.file)

    # convert image mode
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")  # type: ignore

    # resize optional
    if width and height:
        image.thumbnail((width, height))

    # save as webp
    image.save(
        file_path,
        format="WEBP",
        quality=quality,
        optimize=True
    )

    return str(file_path).replace("\\", "/")

def get_skip(page: int = 1, limit: int = 10) -> int:
    return (page - 1) * limit

def has_next(total_count: int, skip: int, limit: int) -> bool:
    return total_count > (skip + limit)