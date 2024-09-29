from fastapi import FastAPI, UploadFile, File
from typing import Dict, List
from app.document_processing import load_documents, split_documents
from app.summarization import summarize_document, summarize_role
from app.graph_updates import get_graph, update_graph_with_document_summary, update_graph_with_role_summary
from app.task_allocation import allocate_tasks

app = FastAPI()

@app.post("/process/")
async def process_documents_and_roles_api(
    files: List[UploadFile] = File(...), 
    team_details: Dict[str, Dict[str, Any]] = None, 
    workspace_id: str = "default_workspace"
):
    """Example Input Output
Input:
file_paths = ["project_plan.pdf", "dev_notes.txt", "marketing_strategy.md"]

team_details = {
    "Alice": {
        "Role": ["Project Manager", "Scrum Master"],
        "description": "Responsible for project execution and ensuring Agile processes.",
        "skills": ["Leadership", "Agile Methodologies", "Risk Management"],
        "projects_experience": ["New Product Launch", "System Migration"]
    },
    "Bob": {
        "Role": ["Software Engineer", "DevOps Engineer"],
        "description": "Develops and maintains software, and handles infrastructure automation.",
        "skills": ["Python", "Docker", "Kubernetes", "Cloud Computing"],
        "projects_experience": ["Microservices Development", "Cloud Migration"]
    },
    "Carol": {
        "Role": ["UX Designer", "UI Designer"],
        "description": "Designs user experiences and interfaces.",
        "skills": ["Figma", "Sketch", "User Research"],
        "projects_experience": ["Website Redesign", "Mobile App Development"]
    },
    "Dave": {
        "Role": ["Marketing Manager"],
        "description": "Responsible for developing and executing marketing strategies.",
        "skills": ["Digital Marketing", "SEO", "Content Strategy"],
        "projects_experience": ["Product Launch Campaign", "Brand Revamp"]
    }
}

workspace_id = "extended_team_db"

Output :
Task allocation per member:
Alice: ['Facilitate daily stand-ups as Scrum Master', 'Monitor project milestones and risks', 'Ensure agile principles are followed by the team']
Bob: ['Develop the microservices backend', 'Automate deployment pipelines with Docker and Kubernetes', 'Optimize cloud infrastructure']
Carol: ['Design user flows for the new website', 'Create UI prototypes in Figma', 'Conduct user research for the mobile app']
Dave: ['Develop content strategy for product launch', 'Coordinate marketing efforts with the development team', 'Optimize SEO for the new website']
    """
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
