'''
 Language Model Service Module is module handles all interactions with language models.

 Author: Tanapat Chamted
'''

from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from typing import Tuple, Dict, Any

def get_llm(model_name: str = "llama-3.1-70b-versatile", temp: float = 0.3) -> ChatGroq:
    '''
     Initialize and return a language model instance.

     find :
        model_name (str)
        temp (float)
        
     Return : ChatGroq
    '''
    return ChatGroq(model=model_name, temperature=temp)

def get_embedding(
    model_name: str = "BAAI/bge-base-en-v1.5"
) -> Tuple[str, Dict[str, str], Dict[str, bool], HuggingFaceBgeEmbeddings]:
    '''
     Initialize and return an embedding model instance.

     find : model_name (str)
        
    Return :
        - str: Model name
        - Dict: Model kwargs
        - Dict: Encode kwargs
        - HuggingFaceBgeEmbeddings: Initialized embeddings model
    '''
    model_kwargs = {'device': 'cpu'}
    encode_kwargs = {'normalize_embeddings': True}
    embeddings = HuggingFaceBgeEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )
    return model_name, model_kwargs, encode_kwargs, embeddings