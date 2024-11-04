from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import time
from tenacity import retry, stop_after_attempt, wait_exponential

def load_documents(file_paths: List[str]) -> List[Any]:
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

def split_documents(
    documents: List[Any], 
    chunk_size_split: int = 10000, 
    chunk_overlap_split: int = 1000
) -> List[Any]:
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size_split, 
        chunk_overlap=chunk_overlap_split
    )
    split_docs = text_splitter.split_documents(documents)
    print(f"Split into {len(split_docs)} chunks.")
    return split_docs

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry_error_callback=lambda retry_state: {}
)
def process_single_document(
    doc_content: str,
    current_roles: List[str],
    llm: Any,
    output_parser: Any,
    request_delay: float = 1.0
) -> Dict[str, List[str]]:
    try:
        prompt = ChatPromptTemplate.from_template(
            template="""
            <system>
            You are a helpful assistant specializing in data extraction from documents.
            </system>

            <user>
            Your task is to extract all roles mentioned in the given documents and their associated tasks.
            Provide your answer as a JSON string where keys are roles and values are lists of tasks.
            Only return the JSON string without any additional explanation or formatting.

            Example format:
            {{"Role1": ["Task1", "Task2", "Task3"], "Role2": ["Task1", "Task2"]}}

            Ensure your output is a valid JSON string that can be parsed directly.
            </user>

            <query>
            Role in my team: {myteam}
            Extract all roles and their associated tasks from the following document:
            {document_content}
            </query>
            """
        )

        chain = prompt | llm | output_parser
        time.sleep(request_delay)
        
        response = chain.invoke({
            "myteam": ", ".join(current_roles),
            "document_content": doc_content
        })
        
        return json.loads(response)
    
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        raise
    except Exception as e:
        print(f"Error during document processing: {e}")
        raise

def process_documents(
    document_paths: List[str],
    current_roles: List[str],
    model_name: str = "llama-3.1-70b-versatile",
    temperature: float = 0.3,
    request_delay: float = 1.0,
    max_retries: int = 3
) -> Dict[str, List[str]]:
    try:
        from src.services.llm_service import get_llm
        
        llm = get_llm(model_name, temperature)
        output_parser = StrOutputParser()
        
        print(f"Loading documents from {len(document_paths)} paths...")
        loaded_docs = load_documents(document_paths)
        print(f"Loaded {len(loaded_docs)} documents successfully.")
        
        roles_tasks_summary = {}
        failed_docs = []
        
        for i, doc in enumerate(loaded_docs, 1):
            print(f"\nProcessing document {i}/{len(loaded_docs)}...")
            try:
                doc_results = process_single_document(
                    doc_content=doc.page_content,
                    current_roles=current_roles,
                    llm=llm,
                    output_parser=output_parser,
                    request_delay=request_delay
                )
                
                print(f"Successfully processed document {i}")
                for role, tasks in doc_results.items():
                    if role not in roles_tasks_summary:
                        roles_tasks_summary[role] = set()
                    roles_tasks_summary[role].update(tasks)
                    
            except Exception as e:
                print(f"Failed to process document {i} after retries: {e}")
                failed_docs.append(doc)
                continue
        
        if failed_docs:
            print(f"\nFailed to process {len(failed_docs)} documents:")
            for doc in failed_docs:
                print(f"- Document: {getattr(doc, 'metadata', {}).get('source', 'Unknown source')}")
        
        result = {
            role: list(tasks) 
            for role, tasks in roles_tasks_summary.items()
        }
        
        result['_processing_summary'] = {
            'total_documents': len(loaded_docs),
            'successful_documents': len(loaded_docs) - len(failed_docs),
            'failed_documents': len(failed_docs),
            'settings': {
                'model': model_name,
                'temperature': temperature,
                'request_delay': request_delay,
                'max_retries': max_retries
            }
        }
        
        return result
        
    except Exception as e:
        print(f"Critical error in document processing pipeline: {e}")
        return {
            '_processing_summary': {
                'error': str(e),
                'total_documents': len(document_paths),
                'successful_documents': 0,
                'failed_documents': len(document_paths),
                'settings': {
                    'model': model_name,
                    'temperature': temperature,
                    'request_delay': request_delay,
                    'max_retries': max_retries
                }
            }
        }