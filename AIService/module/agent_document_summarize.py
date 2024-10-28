from typing import List, Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import time
from tenacity import retry, stop_after_attempt, wait_exponential
from document_processing import load_documents
from get_model_and_embeding import get_llm

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
    """Process a single document with retry logic and rate limiting"""

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
        
        # Add delay before making the API request
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
    """
    Process documents to extract roles and tasks with retry logic and rate limiting
    """
    try:
        # Initialize components
        llm = get_llm(model_name, temperature)
        output_parser = StrOutputParser()
        
        print(f"Loading documents from {len(document_paths)} paths...")
        loaded_docs = load_documents(document_paths)
        print(f"Loaded {len(loaded_docs)} documents successfully.")
        
        # Process each document and combine results
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
                # Update summary with new results
                for role, tasks in doc_results.items():
                    if role not in roles_tasks_summary:
                        roles_tasks_summary[role] = set()
                    roles_tasks_summary[role].update(tasks)
                    
            except Exception as e:
                print(f"Failed to process document {i} after retries: {e}")
                failed_docs.append(doc)
                continue
        
        # Report any failed documents
        if failed_docs:
            print(f"\nFailed to process {len(failed_docs)} documents:")
            for doc in failed_docs:
                print(f"- Document: {getattr(doc, 'metadata', {}).get('source', 'Unknown source')}")
        
        # Convert sets back to lists for JSON serialization
        result = {
            role: list(tasks) 
            for role, tasks in roles_tasks_summary.items()
        }
        
        # Add processing summary
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

def example():
    """
    {
  "Software Developer": [
    "Actual coding",
    "Implement functional cohesion",
    "Construct dynamic model diagram, comprising of state transition diagrams",
    "attempt to quantify software projects by using the size of the project to normalize other quality measures",
    "implement and integrate the services to the final prototype",
    .
    .
    .
  ],
  "UX Designer": [
    "understand customer requirements",
    "understand user specific requirements",
    "create prototypes to get user feedback",
    "give the exact look and feel of the software",
    "System Design",
    "design a software prototype",
    "Planning and organizing the project",
    .
    .
    .
  ],
  "Project Manager": [
    "Use design review for verification and validation",
    "Detect defects caused by overlooking some conditions",
    "Revise and enhance the Prototype",
    "Generate a System Architecture Document",
    "Deployment of system",
    "Check if all requirements are finalized",
    "Maintenance",
    "identify technological or business bottlenecks or challenges early",
    "Requirement Gathering and analysis",
    "Planning and organizing the project",
    "estimation",
    "Implementation",
    "Tracking and running the project",
    "plan integration as a big-bang at the very end",
    "control",
    "Apply software estimation techniques",
    "management control of software project",
    "Integration and Testing",
    "manage project complexity",
    "maintenance",
    "prediction of task duration",
    .
    .
    .
  ],
  "_processing_summary": {
    "total_documents": 27,
    "successful_documents": 27,
    "failed_documents": 0,
    "settings": {
      "model": "llama-3.1-70b-versatile",
      "temperature": 0.3,
      "request_delay": 1.0,
      "max_retries": 3
    }
  }
}
    """
    # Example usage
    document_paths = [
        r"D:\Mindforge\AIService\test_doc\doc1.pdf"
    ]
    
    current_roles = [
        "Software Developer",
        "UX Designer",
        "Project Manager"
    ]
    
    # Process documents
    print("Starting document processing...")
    results = process_documents(
        document_paths=document_paths,
        current_roles=current_roles,
        request_delay=1.0  # 1 second delay between requests
    )
    
    # Print results
    print("\nProcessing Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    example()