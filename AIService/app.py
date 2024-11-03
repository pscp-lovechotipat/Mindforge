# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import json
import tempfile
import os
import shutil

from module.agent_document_summarize import process_documents
from module.agent_human_management import analyze_team_roles, validate_team_details
from module.graph_updates import Neo4jCRUD
from module.get_model_and_embeding import get_llm

# Pydantic models for validation
class TeamMemberBase(BaseModel):
    current_role: str = Field(..., description="Current role of the team member")
    skills: List[str] = Field(..., description="List of skills")
    experience: str = Field(..., description="Experience description")

class TeamDetails(BaseModel):
    team_members: Dict[str, TeamMemberBase] = Field(..., description="Team members and their details")

class NodeUpdate(BaseModel):
    node_id: str = Field(..., description="ID of the node to update")
    node_name: str = Field(..., description="Name of the node")
    new_properties: Dict[str, Any] = Field(..., description="New properties for the node")

class ProcessingResponse(BaseModel):
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None

app = FastAPI(
    title="Team and Document Analysis API",
    description="API for processing documents and analyzing team roles with Neo4j integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neo4j configuration
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "neo4j"

def save_upload_files(files: List[UploadFile]) -> tuple[List[str], str]:
    """Save uploaded files to temporary directory"""
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

@app.post("/analyze", response_model=ProcessingResponse)
async def analyze_documents_and_team(
    workspace_id: str = Form(...),
    team_details: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Process documents and team analysis, storing results in Neo4j.
    
    - **workspace_id**: Unique identifier for the workspace
    - **team_details**: JSON string containing team members information
    - **files**: List of documents to analyze (PDF, TXT, or MD)
    """
    try:
        # Parse and validate team details
        try:
            team_dict = json.loads(team_details)
            team_data = TeamDetails(team_members=team_dict["team_members"])
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid team_details JSON format"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid team details format: {str(e)}"
            )

        # Convert to dictionary format expected by the processing functions
        team_dict = {
            name: {
                "current_role": member.current_role,
                "skills": member.skills,
                "experience": member.experience
            }
            for name, member in team_data.team_members.items()
        }
        
        # Save uploaded files
        file_paths, temp_dir = save_upload_files(files)
        
        try:
            # Initialize LLM
            llm = get_llm()
            
            # Process documents
            document_analysis = process_documents(
                document_paths=file_paths,
                current_roles=[member["current_role"] for member in team_dict.values()]
            )
            
            # Analyze team roles
            team_analysis = analyze_team_roles(team_dict, llm)
            
            # Create Neo4j graph
            db = Neo4jCRUD(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, workspace_id)
            try:
                # Create workspace node
                db.create_node("Workspace", {"name": workspace_id})
                
                # Process roles and tasks
                for role, tasks in document_analysis.items():
                    if role != "_processing_summary":
                        db.create_node("Role", {
                            "name": role,
                            "type": "role"
                        })
                        db.create_relationship(
                            "Workspace", workspace_id,
                            "Role", role,
                            "CONTAINS_ROLE"
                        )
                        
                        for task in tasks:
                            db.create_node("Task", {
                                "name": task,
                                "type": "task"
                            })
                            db.create_relationship(
                                "Role", role,
                                "Task", task,
                                "HAS_TASK"
                            )
                
                # Process team members
                for member_name, possible_roles in team_analysis.items():
                    db.create_node("Person", {
                        "name": member_name,
                        "type": "person"
                    })
                    db.create_relationship(
                        "Workspace", workspace_id,
                        "Person", member_name,
                        "HAS_MEMBER"
                    )
                    
                    for role in possible_roles:
                        if role in document_analysis:
                            db.create_relationship(
                                "Person", member_name,
                                "Role", role,
                                "CAN_PERFORM"
                            )
                
                return ProcessingResponse(
                    status="success",
                    message="Analysis completed successfully",
                    details={
                        "document_analysis_summary": document_analysis.get("_processing_summary", {}),
                        "team_members_processed": len(team_analysis)
                    }
                )
            
            finally:
                db.close()
                
        finally:
            shutil.rmtree(temp_dir)
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )

@app.get("/workspace/{workspace_id}/tasks", response_model=Dict[str, List[Dict[str, Any]]])
async def get_workspace_tasks(workspace_id: str):
    """
    Get distributed tasks for each team member in the workspace
    """
    db = Neo4jCRUD(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, workspace_id)
    try:
        with db.driver.session(database=workspace_id) as session:
            result = session.run("""
                MATCH (w:Workspace {name: $workspace})-[:CONTAINS_ROLE]->(r:Role)-[:HAS_TASK]->(t:Task)
                MATCH (p:Person)-[:CAN_PERFORM]->(r)
                RETURN p.name as person, collect({
                    task: t.name,
                    role: r.name,
                    node_id: ID(t)
                }) as tasks
            """, workspace=workspace_id)
            
            task_distribution = {}
            for record in result:
                task_distribution[record["person"]] = record["tasks"]
            
            return task_distribution
    
    finally:
        db.close()

@app.put("/workspace/{workspace_id}/node", response_model=ProcessingResponse)
async def update_node(workspace_id: str, update: NodeUpdate):
    """
    Update a node's properties
    """
    db = Neo4jCRUD(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, workspace_id)
    try:
        with db.driver.session(database=workspace_id) as session:
            result = session.run("""
                MATCH (n)
                WHERE ID(n) = $node_id AND n.name = $node_name
                SET n += $properties
                RETURN n
            """, 
                node_id=int(update.node_id),
                node_name=update.node_name,
                properties=update.new_properties
            )
            
            if not result.single():
                raise HTTPException(
                    status_code=404,
                    detail=f"Node {update.node_name} not found"
                )
            
            return ProcessingResponse(
                status="success",
                message=f"Node {update.node_name} updated successfully"
            )
    
    finally:
        db.close()

@app.delete("/workspace/{workspace_id}/node", response_model=ProcessingResponse)
async def delete_node(workspace_id: str, node_id: str, node_name: str):
    """
    Delete a node from the graph
    """
    db = Neo4jCRUD(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, workspace_id)
    try:
        with db.driver.session(database=workspace_id) as session:
            result = session.run("""
                MATCH (n)
                WHERE ID(n) = $node_id AND n.name = $node_name
                DETACH DELETE n
                RETURN count(n) as deleted
            """, node_id=int(node_id), node_name=node_name)
            
            if result.single()["deleted"] == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"Node {node_name} not found"
                )
            
            return ProcessingResponse(
                status="success",
                message=f"Node {node_name} deleted successfully"
            )
    
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)