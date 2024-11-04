import os
import shutil
import tempfile
from typing import List, Tuple
from fastapi import UploadFile, HTTPException

def save_upload_files(files: List[UploadFile]) -> Tuple[List[str], str]:
    temp_dir = tempfile.mkdtemp()
    file_paths = []
    
    for file in files:
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.pdf', '.txt', '.md']:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_extension}"
            )
        
        file_path = os.path.join(temp_dir, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_path)
        except Exception as e:
            shutil.rmtree(temp_dir)
            raise HTTPException(
                status_code=500,
                detail=f"Error saving file {file.filename}: {str(e)}"
            )
    
    return file_paths, temp_dir

def cleanup_temp_files(temp_dir: str) -> None:
    try:
        shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Error cleaning up temporary files: {e}")