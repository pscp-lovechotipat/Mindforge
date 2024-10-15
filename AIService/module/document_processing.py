from typing import List, Any
from langchain_community.document_loaders import PyPDFLoader,TextLoader,UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_documents(file_paths: List[str]) -> List[Any]:
   """
   Load Documents
   
   Input : file_path : ex. [path1.pdf , path2.md , path.3.txt]
   Output : Document type string
   """

   print("Loading documents...")
   
   documents = []
   
   for file_path in file_paths:
      if file_path.endswith('.pdf'):
         loader = PyPDFLoader(file_path)
      elif file_path.endswith('.txt'):
         loader = TextLoader(file_path)
      elif file_path.endswith('.md'):
         loader = UnstructuredMarkdownLoader(file_path)
      else:
         print(f"Unsupported file type: {file_path}")
         continue
      documents.extend(loader.load())
   print(f"Loaded {len(documents)} documents.")
   return documents

def split_documents(documents: List[Any], chunk_size_split=10000, chunk_overlap_split=1000) -> List[Any]:
   """ Split Documents Chunking """

   print("Splitting documents into chunks...")

   text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size_split, chunk_overlap=chunk_overlap_split)
   split_docs = text_splitter.split_documents(documents)
   print(f"Split into {len(split_docs)} chunks.")
   return split_docs
