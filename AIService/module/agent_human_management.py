import json
from typing import Dict, List, Any
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from get_model_and_embeding import get_llm

def analyze_team_roles(team_details: Dict[str, Any], llm: Any) -> Dict[str, List[str]]:
    template = """
    <system>
    You are an AI assistant specializing in human resource management and team organization.
    </system>

    <user>
    Based on the provided team member details, identify all possible roles this person could perform effectively.
    Consider their current roles, skills, project experiences, and the description provided.
    Your answer should be a list of role names, including but not limited to their current roles.

    Team Member: {member_name}
    Details: {member_details}

    Provide your answer as a JSON string containing a list of strings, e.g., ["Role1", "Role2", "Role3"]. 
    Only return the JSON string, without any additional explanation.
    </user>
    """

    prompt = ChatPromptTemplate.from_template(template)
    output_parser = StrOutputParser()
    roles_by_member = {}
    
    for member_name, member_details in team_details.items():
        formatted_prompt = prompt.format(member_name=member_name, member_details=str(member_details))
        response = llm(formatted_prompt)
        roles = output_parser.parse(response)
        roles_by_member[member_name] = roles

    return roles_by_member

if __name__  == "__main__":
    team_details = {
    "John Doe": {
        "current_role": "Software Developer",
        "skills": ["Python", "JavaScript", "Docker"],
        "experience": "5 years in web development"
    },
    "Jane Smith": {
        "current_role": "UX Designer",
        "skills": ["UI/UX Design", "Figma", "User Research"],
        "experience": "3 years in product design"
    },
    "Mike Johnson": {
        "current_role": "Project Manager",
        "skills": ["Agile Methodologies", "Risk Management", "Stakeholder Communication"],
        "experience": "7 years in IT project management"
        }
    }

    llm = get_llm()
    result = analyze_team_roles(team_details, llm)
