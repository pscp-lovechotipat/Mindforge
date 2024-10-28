import json
from typing import Dict, List, Any
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers.string import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from module.get_model_and_embeding import get_llm
from typing import Optional
import config

def create_role_analysis_chain(llm: Any):
    """
    Create a LangChain chain for role analysis.
    
    Args:
        llm (Any): Language model instance
        
    Returns:
        Chain: Composed LangChain chain
    """
    template = """
    You are an AI assistant specializing in human resource management and team organization.
    
    Based on the provided team member details, identify all possible roles this person could perform effectively.
    Consider their current roles, skills, project experiences, and the description provided.
    Your answer should be a list of role names, including but not limited to their current roles.

    Team Member: {member_name}
    Details: {member_details}

    Provide your answer as a JSON string containing a list of strings, e.g., ["Role1", "Role2", "Role3"]. 
    Only return the JSON string, without any additional explanation.
    """

    prompt = ChatPromptTemplate.from_template(template)
    output_parser = StrOutputParser()
    
    chain = (
        {"member_name": RunnablePassthrough(), "member_details": RunnablePassthrough()}
        | prompt
        | llm
        | output_parser
    )
    
    return chain

def parse_roles_response(response: str) -> List[str]:
    """
    Parse the LLM response into a list of roles.
    
    Args:
        response (str): JSON string response from LLM
        
    Returns:
        List[str]: List of roles
        
    Raises:
        RoleAnalysisError: If parsing fails
    """
    cleaned_response = response.strip()
    roles = json.loads(cleaned_response)
    
    if not isinstance(roles, list) or not all(isinstance(role, str) for role in roles):
        raise ValueError("Response must be a list of strings")
        
    return roles

def analyze_team_roles(
    team_details: Dict[str, Any], 
    llm: Any,
    max_retries: int = 3
) -> Dict[str, List[str]]:
    """
    Analyze possible roles for each team member using LangChain chain.
    
    Args:
        team_details (Dict[str, Any]): Dictionary containing team member details
        llm (Any): Language model instance
        max_retries (int, optional): Maximum number of retries for failed analyses. Defaults to 3.
        
    Returns:
        Dict[str, List[str]]: Dictionary mapping team members to their potential roles
        
    Raises:
        RoleAnalysisError: If analysis fails for any team member after all retries
    """
    chain = create_role_analysis_chain(llm)
    roles_by_member: Dict[str, List[str]] = {}
    
    for member_name, member_details in team_details.items():
        print(f"Analyzing roles for team member: {member_name}")
        
        for _ in range(max_retries):
            response = chain.invoke({
                "member_name": member_name,
                "member_details": str(member_details)
            })
            roles = parse_roles_response(response)
            
            roles_by_member[member_name] = roles
            print(f"Successfully analyzed roles for {member_name}")
            break

    return roles_by_member

def validate_team_details(team_details: Dict[str, Any]) -> None:
    """
    Validate the structure of team details input.
    
    Args:
        team_details (Dict[str, Any]): Team details to validate
        
    Raises:
        ValueError: If validation fails
    """
    required_fields = {'current_role', 'skills', 'experience'}
    
    if not team_details:
        raise ValueError("Team details cannot be empty")
        
    for member_name, details in team_details.items():
        if not isinstance(details, dict):
            raise ValueError(f"Details for {member_name} must be a dictionary")
            
        missing_fields = required_fields - set(details.keys())
        if missing_fields:
            raise ValueError(
                f"Missing required fields for {member_name}: {missing_fields}"
            )
            
        if not isinstance(details['skills'], list):
            raise ValueError(f"Skills for {member_name} must be a list")

async def analyze_team_roles_async(
    team_details: Dict[str, Any], 
    llm: Any,
    max_retries: int = 3
) -> Dict[str, List[str]]:
    """
    Asynchronous version of analyze_team_roles using LangChain chain.
    
    Args:
        team_details (Dict[str, Any]): Dictionary containing team member details
        llm (Any): Language model instance
        max_retries (int, optional): Maximum number of retries for failed analyses. Defaults to 3.
        
    Returns:
        Dict[str, List[str]]: Dictionary mapping team members to their potential roles
    """
    chain = create_role_analysis_chain(llm)
    roles_by_member: Dict[str, List[str]] = {}
    
    for member_name, member_details in team_details.items():
        print(f"Analyzing roles for team member: {member_name}")
        
        for _ in range(max_retries):
            response = await chain.ainvoke({
                "member_name": member_name,
                "member_details": str(member_details)
            })
            roles = parse_roles_response(response)
            
            roles_by_member[member_name] = roles
            print(f"Successfully analyzed roles for {member_name}")
            break

    return roles_by_member

if __name__ == "__main__":
    # Example usage
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

    validate_team_details(team_details)
    llm = get_llm()
    
    # Synchronous execution
    result = analyze_team_roles(team_details, llm)
    print("Synchronous Results:")
    print(json.dumps(result, indent=2))
        