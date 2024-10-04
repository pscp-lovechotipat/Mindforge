import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import Dict, List
from pydantic import BaseModel, RootModel
import aiofiles
from module.document_processing import load_documents, split_documents
from module.agent_document_summarize import summarize_documents
from module.agent_human_management import analyze_team_roles
from module.graph_updates import Neo4jCRUD
from module.get_model_and_embeding import get_llm, get_embedding
from config import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD

app = FastAPI()

class TeamMember(BaseModel):
    role: List[str]
    description: str
    skills: List[str]
    projects_experience: List[str]

class TeamDetails(RootModel):
    root: Dict[str, TeamMember]

@app.get("/")
def first():
    return "Hello Chotipat"

@app.post("/process/")
async def process_documents_and_roles_api(
    files: List[UploadFile] = File(...),
    team_details: TeamDetails = None,
    workspace_id: str = "default_workspace"
):
    print(f"Run on Workspace id {workspace_id}")
    workspace_dir = f"workspaces/{workspace_id}"
    os.makedirs(workspace_dir, exist_ok=True)
    file_paths = []
    for file in files:
        try:
            file_path = os.path.join(workspace_dir, file.filename)
            async with aiofiles.open(file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)
            file_paths.append(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error saving file {file.filename}: {str(e)}")

    print(f"Load file {file_paths}")
    try:
        print(f"load Document")
        documents = load_documents(file_paths)
        
        print(f"Split Docs")
        split_docs = split_documents(documents)
        
        print(f"Get LLM")
        llm = get_llm()
        
        print(f"Get embedding")
        _, _, _, embeddings = get_embedding()
        
        print(f"Summarize tasks from documents")
        role_tasks = summarize_documents(split_docs, llm, embeddings)
        print(role_tasks)

        print(f"Analyze team roles")
        team_role_analysis = analyze_team_roles(team_details.root, llm)
        print(team_role_analysis)

        print(f"Connect Graph Database")
        neo4j_crud = Neo4jCRUD(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, workspace_id)

        for role, tasks in role_tasks.items():
            neo4j_crud.create_node("Role", {"name": role})
            for task in tasks:
                neo4j_crud.create_node("Task", {"name": task})
                neo4j_crud.create_relationship("Role", role, "Task", task, "HAS_TASK")

        for member, roles in team_role_analysis.items():
            neo4j_crud.create_node("Person", {"name": member})
            for role in roles:
                neo4j_crud.create_relationship("Person", member, "Role", role, "CAN_PERFORM")

        graph = neo4j_crud.get_graph()
        neo4j_crud.close()

        return {
            "message": "Processing complete",
            "workspace_id": workspace_id,
            "role_tasks": role_tasks,
            "team_role_analysis": team_role_analysis,
            "graph": graph
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
