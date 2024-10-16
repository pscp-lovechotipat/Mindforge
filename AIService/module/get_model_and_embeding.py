from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

# Define your LLM
def get_llm(model_name:str = "llama-3.1-70b-versatile" , temp:float = 0.3):

    """Get LLM Model"""
    return ChatGroq(model=f"{model_name}", temperature=temp)

def get_embedding(_model_name:str = "BAAI/bge-base-en-v1.5"):
    
    """Get Embeddings"""
    model_name = f"{_model_name}"
    model_kwargs = {'device': 'cpu'}
    encode_kwargs = {'normalize_embeddings': True}
    embeddings = HuggingFaceBgeEmbeddings(

        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs

)
    return model_name , model_kwargs , encode_kwargs , embeddings
