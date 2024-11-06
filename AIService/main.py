"""
Main FastAPI Application Module is the main entry point for the FastAPI application.

Author: Tanapat Chamted
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime

from src.core.models import TeamDetails, NodeUpdate, ProcessingResponse
from src.services.document_processor import process_documents
from src.services.team_analyzer import analyze_team_roles, validate_team_details
from src.services.graph_manager import (
    Neo4jManager,
    add_task_to_role,
    create_neo4j_manager,
    create_node,
    create_relationship,
    get_workspace_tasks,
    update_node_by_id,
    delete_node_by_id,
    get_graph_statistics
)
from src.services.llm_service import get_llm
from src.utils.file_handler import save_upload_files, cleanup_temp_files
import json
from config import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD

# Initialize FastAPI app
app = FastAPI(
    swagger_ui_parameters={"syntaxHighlight.theme": "obsidian"},
    title="Team and Document Analysis API",
    description="API for processing documents and analyzing team roles with Neo4j integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=ProcessingResponse)
async def analyze_documents_and_team(
    workspace_id: str = Form(...),
    team_details: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Process documents and team analysis, storing results in Neo4j.
    
    Args:
        workspace_id (str): Unique identifier for the workspace
        team_details (str): JSON string containing team members information
        files (List[UploadFile]): List of documents to analyze
        
    Returns:
        ProcessingResponse: Analysis results and status
    """
    neo4j_manager = None
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

        # Convert to expected format
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
            # Initialize components
            print("Initializing LLM model...")
            llm = get_llm()
            
            print("Processing documents...")
            document_analysis = process_documents(
                document_paths=file_paths,
                current_roles=[member["current_role"] for member in team_dict.values()]
            )
            
            print("Analyzing team roles...")
            team_analysis = analyze_team_roles(team_dict, llm)
            
            # Initialize Neo4j
            try:
                print(f"Initializing database connection for {workspace_id}...")
                neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
                db_name = neo4j_manager.init_database(workspace_id)
                
                # Create workspace node
                print("Creating workspace node...")
                create_node(neo4j_manager, db_name, "Workspace", {
                    "name": workspace_id,
                    "type": "workspace",
                    "created_at": datetime.now().isoformat(),
                    "document_count": len(file_paths),
                    "team_size": len(team_dict)
                })
                
                # Process roles and tasks
                print("Processing roles and tasks...")
                for role, tasks in document_analysis.items():
                    if role != "_processing_summary":
                        # Create role node
                        create_node(neo4j_manager, db_name, "Role", {
                            "name": role,
                            "type": "role",
                            "task_count": len(tasks)
                        })
                        
                        # Link role to workspace
                        create_relationship(
                            neo4j_manager,
                            db_name,
                            "Workspace", workspace_id,
                            "Role", role,
                            "CONTAINS_ROLE"
                        )
                        
                        # Create and link tasks
                        for task in tasks:
                            create_node(neo4j_manager, db_name, "Task", {
                                "name": task,
                                "type": "task",
                                "status": "pending",
                                "priority": "medium",
                                "estimated_hours": 0
                            })
                            create_relationship(
                                neo4j_manager,
                                db_name,
                                "Role", role,
                                "Task", task,
                                "HAS_TASK"
                            )
                
                # Process team members
                print("Processing team members...")
                for member_name, possible_roles in team_analysis.items():
                    # Create person node
                    create_node(neo4j_manager, db_name, "Person", {
                        "name": member_name,
                        "type": "person",
                        "details": json.dumps(team_dict[member_name]),
                        "role_count": len(possible_roles)
                    })
                    
                    # Link person to workspace
                    create_relationship(
                        neo4j_manager,
                        db_name,
                        "Workspace", workspace_id,
                        "Person", member_name,
                        "HAS_MEMBER"
                    )
                    
                    # Link person to roles
                    for role in possible_roles:
                        if role in document_analysis:
                            create_relationship(
                                neo4j_manager,
                                db_name,
                                "Person", member_name,
                                "Role", role,
                                "CAN_PERFORM"
                            )
                
                # Get graph statistics
                stats = get_graph_statistics(neo4j_manager, db_name, workspace_id)
                
                return ProcessingResponse(
                    status="success",
                    message="Analysis completed successfully",
                    details={
                        "document_analysis_summary": document_analysis.get("_processing_summary", {}),
                        "team_members_processed": len(team_analysis),
                        "graph_statistics": stats
                    }
                )
            
            finally:
                if neo4j_manager:
                    neo4j_manager.close()
                    
        finally:
            cleanup_temp_files(temp_dir)
            
    except Exception as e:
        if neo4j_manager:
            neo4j_manager.close()
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )

@app.get("/workspace/{workspace_id}/tasks")
async def get_tasks(workspace_id: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get distributed tasks for each team member in the workspace.
    
    Args:
        workspace_id (str): Workspace identifier
        
    Returns:
        Dict[str, List[Dict[str, Any]]]: Tasks grouped by team member
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        return get_workspace_tasks(neo4j_manager, db_name, workspace_id)
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.get("/workspace/{workspace_id}/statistics", response_model=Dict[str, Any])
async def get_workspace_statistics(workspace_id: str) -> Dict[str, Any]:
    """
    Get statistics about the workspace.
    
    Args:
        workspace_id (str): Workspace identifier
        
    Returns:
        Dict[str, Any]: Workspace statistics
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        return get_graph_statistics(neo4j_manager, db_name, workspace_id)
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.put("/workspace/{workspace_id}/node", response_model=ProcessingResponse)
async def update_node_properties(
    workspace_id: str,
    update_data: NodeUpdate
) -> ProcessingResponse:
    """
    Update a node's properties.
    
    Args:
        workspace_id (str): Workspace identifier
        update_data (NodeUpdate): Node update information
        
    Returns:
        ProcessingResponse: Update status
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        success = update_node_by_id(
            neo4j_manager,
            db_name,
            int(update_data.node_id),
            update_data.new_properties
        )
        
        if success:
            return ProcessingResponse(
                status="success",
                message=f"Node updated successfully",
                details={
                    "node_id": update_data.node_id,
                    "updated_properties": update_data.new_properties,
                    "updated_at": datetime.now().isoformat()
                }
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Node not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating node: {str(e)}"
        )
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.delete("/workspace/{workspace_id}/node/{node_id}")
async def delete_node_endpoint(
    workspace_id: str,
    node_id: int
) -> ProcessingResponse:
    """
    Delete a node from the graph.
    
    Args:
        workspace_id (str): Workspace identifier
        node_id (int): Node identifier
        
    Returns:
        ProcessingResponse: Deletion status
    """
    neo4j_manager = None
    try:
        print(f"Deleting node {node_id} from workspace {workspace_id}")
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        # ตรวจสอบว่า node มีอยู่จริงก่อนลบ
        check_query = """
        MATCH (n) 
        WHERE ID(n) = $node_id
        RETURN n
        """
        
        result = neo4j_manager.execute_with_retry(db_name, check_query, {"node_id": node_id})
        if not result['data']:
            raise HTTPException(
                status_code=404,
                detail=f"Node with ID {node_id} not found"
            )
        
        # ลบ node และ relationships ที่เกี่ยวข้อง
        delete_query = """
        MATCH (n)
        WHERE ID(n) = $node_id
        DETACH DELETE n
        """
        
        neo4j_manager.execute_with_retry(db_name, delete_query, {"node_id": node_id})
        
        return ProcessingResponse(
            status="success",
            message=f"Node {node_id} deleted successfully",
            details={
                "node_id": node_id,
                "workspace_id": workspace_id,
                "deleted_at": datetime.now().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting node: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting node: {str(e)}"
        )
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.get("/health", response_model=ProcessingResponse)
async def health_check():
    """
    Health check endpoint to verify API is running.
    
    Returns:
        ProcessingResponse: Health status
    """
    try:
        # Try to create a Neo4j connection
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        neo4j_manager.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return ProcessingResponse(
        status="success",
        message="API is running",
        details={
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "database_status": db_status,
            "endpoints": [
                "/analyze",
                "/workspace/{workspace_id}/tasks",
                "/workspace/{workspace_id}/statistics",
                "/workspace/{workspace_id}/node",
                "/health"
            ]
        }
    )

@app.post("/workspace/{workspace_id}/task", response_model=ProcessingResponse)
async def add_task(
    workspace_id: str,
    role_name: str = Form(...),
    task_name: str = Form(...),
    description: str = Form(None),
    priority: str = Form("medium"),
    estimated_hours: float = Form(0.0)
):
    """Add a new task to a role"""
    neo4j_manager = None
    try:
        print(f"Adding task: {task_name} for role: {role_name}")
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        # Verify role exists
        query = """
        MATCH (r:Role {name: $role_name})
        RETURN r
        """
        result = neo4j_manager.execute_with_retry(db_name, query, {"role_name": role_name})
        if not result['data']:
            raise HTTPException(
                status_code=404,
                detail=f"Role '{role_name}' not found in workspace"
            )
        
        # Create task node
        task_properties = {
            "name": task_name,
            "type": "task",
            "status": "pending",
            "description": description or "",
            "priority": priority,
            "estimated_hours": float(estimated_hours),
            "created_at": datetime.now().isoformat()
        }
        
        print(f"Creating task with properties: {task_properties}")
        task_result = neo4j_manager.execute_with_retry(
            db_name,
            """
            CREATE (t:Task $properties)
            RETURN ID(t) as id, t
            """,
            {"properties": task_properties}
        )
        
        if not task_result['data']:
            raise Exception("Failed to create task node")
            
        task_id = task_result['data'][0]['id']
        
        # Create relationship
        rel_result = neo4j_manager.execute_with_retry(
            db_name,
            """
            MATCH (r:Role {name: $role_name})
            MATCH (t:Task) WHERE ID(t) = $task_id
            CREATE (r)-[rel:HAS_TASK {created_at: $timestamp}]->(t)
            RETURN rel
            """,
            {
                "role_name": role_name,
                "task_id": task_id,
                "timestamp": task_properties["created_at"]
            }
        )
        
        if not rel_result['data']:
            raise Exception("Failed to create relationship")
        
        return ProcessingResponse(
            status="success",
            message=f"Task '{task_name}' created successfully",
            details={
                "task_name": task_name,
                "role_name": role_name,
                "node_id": task_id,
                "properties": task_properties
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in add_task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error adding task: {str(e)}"
        )
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.get("/workspace/{workspace_id}/graph")
async def get_workspace_graph(workspace_id: str) -> Dict[str, Any]:
    """
    Get the complete graph structure for visualization.
    
    Args:
        workspace_id (str): Workspace identifier
        
    Returns:
        Dict[str, Any]: Graph nodes and edges
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        query = """
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN collect(distinct {
            id: ID(n),
            label: n.name,
            type: n.type,
            status: n.status,
            priority: n.priority,
            assignee: n.assignee,
            created_at: n.created_at,
            properties: properties(n)
        }) as nodes,
        collect(distinct {
            id: ID(r),
            from: ID(startNode(r)),
            to: ID(endNode(r)),
            type: type(r),
            properties: properties(r)
        }) as edges
        """
        
        result = neo4j_manager.execute_with_retry(db_name, query)
        data = result['data'][0]
        
        return {
            "nodes": [node for node in data["nodes"] if node["id"] is not None],
            "edges": [edge for edge in data["edges"] if edge["id"] is not None]
        }
        
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.get("/workspace/{workspace_id}/members")
async def get_workspace_members(workspace_id: str) -> List[Dict[str, Any]]:
    """
    Get all team members in the workspace.
    
    Args:
        workspace_id (str): Workspace identifier
        
    Returns:
        List[Dict[str, Any]]: List of team members
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        query = """
        MATCH (p:Person)
        RETURN collect({
            name: p.name,
            type: p.type,
            details: p.details
        }) as members
        """
        
        result = neo4j_manager.execute_with_retry(db_name, query)
        return result['data'][0]["members"]
        
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.put("/workspace/{workspace_id}/node/{node_id}")
async def update_node_details(
    workspace_id: str,
    node_id: int,
    node_data: Dict[str, Any]
) -> ProcessingResponse:
    """
    Update node details including assignee for tasks.
    
    Args:
        workspace_id (str): Workspace identifier
        node_id (int): Node ID to update
        node_data (Dict[str, Any]): New node data
        
    Returns:
        ProcessingResponse: Update status
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        # เพิ่ม timestamp การอัพเดต
        node_data['updated_at'] = datetime.now().isoformat()
        
        # ถ้ามีการ assign งาน ให้สร้าง relation ASSIGNED_TO
        if node_data.get('type') == 'Task' and node_data.get('assignee'):
            # ลบ relation ASSIGNED_TO เดิม (ถ้ามี)
            query_delete_assign = """
            MATCH (t)-[r:ASSIGNED_TO]->()
            WHERE ID(t) = $node_id
            DELETE r
            """
            neo4j_manager.execute_with_retry(db_name, query_delete_assign, {"node_id": node_id})
            
            # สร้าง relation ใหม่
            query_assign = """
            MATCH (t), (p:Person {name: $assignee})
            WHERE ID(t) = $node_id
            CREATE (t)-[r:ASSIGNED_TO]->(p)
            SET r.created_at = $timestamp
            RETURN r
            """
            neo4j_manager.execute_with_retry(
                db_name,
                query_assign,
                {
                    "node_id": node_id,
                    "assignee": node_data['assignee'],
                    "timestamp": node_data['updated_at']
                }
            )
        
        # อัพเดตข้อมูล node
        success = update_node_by_id(neo4j_manager, db_name, node_id, node_data)
        
        if success:
            return ProcessingResponse(
                status="success",
                message=f"Node updated successfully",
                details={
                    "node_id": node_id,
                    "updated_properties": node_data
                }
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Node not found"
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating node: {str(e)}"
        )
    finally:
        if neo4j_manager:
            neo4j_manager.close()

@app.delete("/workspace/{workspace_id}/edge/{edge_id}")
async def delete_edge(
    workspace_id: str,
    edge_id: int
) -> ProcessingResponse:
    """
    Delete a relationship/edge from the graph.
    
    Args:
        workspace_id (str): Workspace identifier
        edge_id (int): Edge ID to delete
        
    Returns:
        ProcessingResponse: Deletion status
    """
    neo4j_manager = None
    try:
        neo4j_manager = create_neo4j_manager(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
        db_name = neo4j_manager.init_database(workspace_id)
        
        query = """
        MATCH ()-[r]->()
        WHERE ID(r) = $edge_id
        DELETE r
        """
        
        result = neo4j_manager.execute_with_retry(db_name, query, {"edge_id": edge_id})
        
        if result['summary'].counters.relationships_deleted > 0:
            return ProcessingResponse(
                status="success",
                message=f"Edge deleted successfully",
                details={"edge_id": edge_id}
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Edge not found"
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting edge: {str(e)}"
        )
    finally:
        if neo4j_manager:
            neo4j_manager.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )