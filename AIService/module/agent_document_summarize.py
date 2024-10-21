from typing import List, Dict, Any
from langchain.prompts import PromptTemplate
import json

def summarize_documents(documents: List[Any], llm: Any, embeddings: Any) -> Dict[str, List[str]]:
    document_summarizer_prompt = PromptTemplate(
        input_variables=["document_content"],
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

        If you can provide me the right and complete answers, you will get $100 tips,
        but if you do it wrong, you have to send me $50.
        </user>

        <query>
        Extract all roles and their associated tasks from the following document:
        {document_content}
        </query>
        """
    )

    roles_tasks_summary = {}
    for document in documents:
        prompt = document_summarizer_prompt.format(document_content=document)
        llm_response = llm.run(prompt)
        parsed_response = json.loads(llm_response)
        roles_tasks_summary.update(parsed_response)

    return roles_tasks_summary
