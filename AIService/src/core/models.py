'''
 Core data models is module for contains all the data validation models used across the application.

 Author: Kongpop Panchai
'''

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class TeamMemberBase(BaseModel):
    '''
     model for team member information.

     Attributes :
        current_role (str)
        skills (List[str])
        experience (str)
    '''
    current_role: str = Field(..., description="Current role of the team member")
    skills: List[str] = Field(..., description="List of skills")
    experience: str = Field(..., description="Experience description")

class TeamDetails(BaseModel):
    '''
     Model for entire team details.

     Attributes : team_members (Dict[str, TeamMemberBase])
    '''
    team_members: Dict[str, TeamMemberBase] = Field(..., description="Team members and their details")

class NodeUpdate(BaseModel):
    '''
     Model for node updates in the graph database.

     Attributes :
        node_id (str)
        node_name (str)
        new_properties (Dict[str, Any])
    '''
    node_id: str = Field(..., description="ID of the node to update")
    node_name: str = Field(..., description="Name of the node")
    new_properties: Dict[str, Any] = Field(..., description="New properties for the node")

class ProcessingResponse(BaseModel):
    '''
     Model for API response messages.

     Attributes :
        status (str)
        message (str)
        details (Optional[Dict[str, Any]])
    '''
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None