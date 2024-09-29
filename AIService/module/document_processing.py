import logging
from typing import List, Any

logger = logging.getLogger(__name__)

def load_documents(file_paths: List[str]) -> List[Any]:
   """Extract Document"""
   pass

def split_documents(documents: List[Any], chunk_size_split=10000, chunk_overlap_split=1000) -> List[Any]:
   """Split to chunking"""