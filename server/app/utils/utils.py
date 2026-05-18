from datetime import datetime, timezone

from fastapi import UploadFile
from PIL import Image
from pathlib import Path
import os

from app.config import get_config


BASE_UPLOAD_DIR = Path("uploads")

config = get_config()

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
    final_filename = f"{filename.replace(' ', '_').lower()}_{datetime.now(timezone.utc).timestamp()}.webp"

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

    return config.site_link + '/' + str(file_path).replace("\\", "/")


def delete_image_from_url(image_url: str | None) -> bool:
   
    if not image_url:
        return False
        
    try:
      
        if "uploads/" in image_url:

            relative_path_str = image_url.split("uploads/")[-1] 
            

            file_path = BASE_UPLOAD_DIR / relative_path_str

         
            if file_path.exists():
                os.remove(file_path)

                return True
            else:
                print(f"File not found on disk: {file_path}")
        else:
            print(f"Invalid image URL format: {image_url}")
            
    except Exception as e:
        print(f"Error deleting image file from URL {image_url}: {str(e)}")
        
    return False

def get_skip(page: int = 1, limit: int = 10) -> int:
    return (page - 1) * limit

def has_next(total_count: int, skip: int, limit: int) -> bool:
    return total_count > (skip + limit)