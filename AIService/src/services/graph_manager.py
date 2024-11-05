'''
 Graph Database Management Service Module is handles all Neo4j graph database operations.

 Author: Tanapat Chamted
'''

from neo4j import GraphDatabase, Result
from typing import Dict, Any, Optional, List, Union
import re
import time
import json
from datetime import datetime

class Neo4jManager:
    '''
     Manager class for Neo4j database operations
    '''
    def __init__(self, uri: str, user: str, password: str):
        '''
         Initialize Neo4j connection.

         find :
            uri (str)
            user (str)
            password (str)
        '''
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        '''
         Close the database connection.
        '''
        if self.driver:
            self.driver.close()

    def init_database(self, db_name: str) -> str:
        '''
         Initialize database with retry mechanism.

         find : db_name (str)
            
         Return : str
            
         Error : Exception
        '''
        safe_db_name = re.sub(r'[^a-zA-Z0-9]', '', db_name)
        max_retries = 5
        retry_delay = 2
        
        try:
            # Use system database to create new database
            with self.driver.session(database="system") as session:
                # Check if database exists
                result = session.run("SHOW DATABASES")
                exists = any(record["name"] == safe_db_name for record in result)
                
                if not exists:
                    print(f"Creating database {safe_db_name}...")
                    session.run(f"CREATE DATABASE {safe_db_name}")
                    
                    # Wait for database to be ready
                    for attempt in range(max_retries):
                        time.sleep(retry_delay)
                        result = session.run("SHOW DATABASES")
                        for record in result:
                            if record["name"] == safe_db_name:
                                status = record["currentStatus"]
                                if status == "online":
                                    print(f"Database {safe_db_name} is ready")
                                    return safe_db_name
                                else:
                                    print(f"Database status: {status}, attempt {attempt + 1}/{max_retries}")
                                break
                    
                    raise Exception(f"Database {safe_db_name} not ready after {max_retries} attempts")
                else:
                    print(f"Database {safe_db_name} already exists and will be used")
                    return safe_db_name
                    
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            raise

    def execute_with_retry(self, db_name: str, query: str, parameters: Dict = None) -> Dict[str, Any]:
        '''
         Execute query with retry mechanism.

         find :
            db_name (str)
            query (str)
            parameters (Dict)
            
         Return : Dict[str, Any]
            
         Error : Exception
        '''
        max_retries = 3
        retry_delay = 1
        last_error = None
        
        for attempt in range(max_retries):
            try:
                with self.driver.session(database=db_name) as session:
                    # Execute query and collect results immediately
                    result = session.run(query, parameters or {})
                    # For queries that return data, collect it
                    data = list(result)
                    # Get summary information
                    summary = result.consume()
                    return {
                        'data': data,
                        'summary': summary
                    }
            except Exception as e:
                last_error = e
                if attempt == max_retries - 1:
                    print(f"Final attempt failed with error: {str(e)}")
                    print(f"Query: {query}")
                    print(f"Parameters: {parameters}")
                    raise
                print(f"Query attempt {attempt + 1} failed: {str(e)}, retrying...")
                time.sleep(retry_delay)

def create_neo4j_manager(uri: str, user: str, password: str) -> Neo4jManager:
    '''
     Create and return Neo4j manager instance.

     find :
        uri (str)
        user (str)
        password (str)
        
     Return : Neo4jManager
    '''
    return Neo4jManager(uri, user, password)

def serialize_property_value(value: Any) -> Any:
    '''
     Serialize property value if needed.

     find : value
        
     Return : Serialized value
    '''
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return value

def create_node(manager: Neo4jManager, db_name: str, label: str, properties: Dict[str, Any]) -> Dict[str, Any]:
    '''
     Create a node in the graph database.

     find :
        manager (Neo4jManager)
        db_name (str)
        label (str)
        properties (Dict[str, Any])
        
     Return : Dict[str, Any]
        
     Error : Exception
    '''
    if 'created_at' not in properties:
        properties['created_at'] = datetime.now().isoformat()

    # Process properties to handle complex types
    processed_properties = {
        key: serialize_property_value(value)
        for key, value in properties.items()
    }

    query = f"""
    CREATE (n:{label} $properties)
    RETURN n
    """

    try:
        print(f"Creating node: {label} with name: {properties.get('name', 'unnamed')}")
        result = manager.execute_with_retry(
            db_name,
            query,
            {"properties": processed_properties}
        )
        print(f"Node created successfully")
        return result['data'][0] if result['data'] else None
    except Exception as e:
        print(f"Error creating node: {str(e)}")
        print(f"Query: {query}")
        print(f"Properties: {processed_properties}")
        raise

def create_relationship(
    manager: Neo4jManager,
    db_name: str,
    label1: str,
    name1: str,
    label2: str,
    name2: str,
    rel_type: str,
    rel_properties: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    '''
     Create a relationship between nodes.

     find :
        manager (Neo4jManager)
        db_name (str)
        label1 (str)
        name1 (str)
        label2 (str)
        name2 (str)
        rel_type (str)
        rel_properties (Optional[Dict[str, Any]])
        
     Return : Dict[str, Any]
        
     Error : Exception
    '''
    props = rel_properties or {}
    if 'created_at' not in props:
        props['created_at'] = datetime.now().isoformat()

    # Process properties to handle complex types
    processed_props = {
        key: serialize_property_value(value)
        for key, value in props.items()
    }

    # Create property string for the query
    if processed_props:
        props_list = [f"{k}: ${k}" for k in processed_props.keys()]
        props_str = f"{{{', '.join(props_list)}}}"
        query = f"""
        MATCH (a:{label1}), (b:{label2})
        WHERE a.name = $name1 AND b.name = $name2
        CREATE (a)-[r:{rel_type} {props_str}]->(b)
        RETURN a, r, b
        """
    else:
        query = f"""
        MATCH (a:{label1}), (b:{label2})
        WHERE a.name = $name1 AND b.name = $name2
        CREATE (a)-[r:{rel_type}]->(b)
        RETURN a, r, b
        """

    params = {
        "name1": name1,
        "name2": name2,
        **processed_props
    }

    try:
        print(f"Creating relationship: ({label1})-[{rel_type}]->({label2})")
        result = manager.execute_with_retry(db_name, query, params)
        print(f"Relationship created successfully")
        return result['data'][0] if result['data'] else None
    except Exception as e:
        print(f"Error creating relationship: {str(e)}")
        print(f"Query: {query}")
        print(f"Parameters: {params}")
        raise

def get_node_by_id(manager: Neo4jManager, db_name: str, node_id: int) -> Optional[Dict[str, Any]]:
    '''
     Retrieve a node by its ID.

     find :
        manager (Neo4jManager)
        db_name (str)
        node_id (int)
        
     Return : Optional[Dict[str, Any]]
    '''
    query = """
    MATCH (n)
    WHERE ID(n) = $node_id
    RETURN n
    """
    
    result = manager.execute_with_retry(db_name, query, {"node_id": node_id})
    if result['data']:
        node = result['data'][0]["n"]
        return dict(node)
    return None

def get_workspace_tasks(manager: Neo4jManager, db_name: str, workspace_id: str) -> Dict[str, List[Dict[str, Any]]]:
    '''
     Get workspace tasks.

     find :
        manager (Neo4jManager)
        db_name (str)
        workspace_id (str)
        
     Return : Dict[str, List[Dict[str, Any]]]
    '''
    query = """
    MATCH (w:Workspace {name: $workspace})-[:CONTAINS_ROLE]->(r)-[:HAS_TASK]->(t)
    MATCH (p:Person)-[:CAN_PERFORM]->(r)
    RETURN p.name as person,
           collect({
               task: t.name,
               role: r.name,
               node_id: ID(t),
               status: t.status,
               created_at: t.created_at,
               priority: t.priority,
               estimated_hours: t.estimated_hours
           }) as tasks
    ORDER BY p.name
    """
    
    result = manager.execute_with_retry(db_name, query, {"workspace": workspace_id})
    tasks_by_person = {}
    for record in result['data']:
        tasks_by_person[record["person"]] = record["tasks"]
    return tasks_by_person

def update_node_by_id(manager: Neo4jManager, db_name: str, node_id: int, new_properties: Dict[str, Any]) -> bool:
    '''
     Update node properties.

     find :
        manager (Neo4jManager): Database manager
        db_name (str): Database name
        node_id (int): Node ID
        new_properties (Dict[str, Any]): New properties to set
        
     Return : bool
    '''
    new_properties['updated_at'] = datetime.now().isoformat()
    
    # Process properties to handle complex types
    processed_properties = {
        key: serialize_property_value(value)
        for key, value in new_properties.items()
    }
    
    query = """
    MATCH (n)
    WHERE ID(n) = $node_id
    SET n += $new_properties
    RETURN n
    """
    
    result = manager.execute_with_retry(
        db_name,
        query,
        {"node_id": node_id, "new_properties": processed_properties}
    )
    return bool(result['data'])

def delete_node_by_id(manager: Neo4jManager, db_name: str, node_id: int) -> bool:
    '''
     Delete a node and its relationships from the database.

     find :
        manager (Neo4jManager)
        db_name (str)
        node_id (int)
        
     Return : bool
    '''
    # Check if node exists
    check_query = """
    MATCH (n) 
    WHERE ID(n) = $node_id
    RETURN n
    """
    
    result = manager.execute_with_retry(db_name, check_query, {"node_id": node_id})
    if not result['data']:
        return False
    
    # Delete node and relationships
    delete_query = """
    MATCH (n)
    WHERE ID(n) = $node_id
    DETACH DELETE n
    """
    
    delete_result = manager.execute_with_retry(db_name, delete_query, {"node_id": node_id})
    return True

def get_graph_statistics(manager: Neo4jManager, db_name: str, workspace_id: str) -> Dict[str, Any]:
    '''
     Get graph statistics.

     find :
        manager (Neo4jManager)
        db_name (str)
        workspace_id (str)
        
     Return : Dict[str, Any]
    '''
    query = """
    MATCH (w:Workspace {name: $workspace})
    OPTIONAL MATCH (w)-[:CONTAINS_ROLE]->(r)
    OPTIONAL MATCH (r)-[:HAS_TASK]->(t)
    OPTIONAL MATCH (p:Person)-[:CAN_PERFORM]->(r)
    RETURN
        count(DISTINCT r) as role_count,
        count(DISTINCT t) as task_count,
        count(DISTINCT p) as person_count,
        collect(DISTINCT r.name) as roles,
        collect(DISTINCT p.name) as team_members,
        collect(DISTINCT t.status) as task_statuses
    """
    
    result = manager.execute_with_retry(db_name, query, {"workspace": workspace_id})
    if not result['data']:
        return {}
        
    record = result['data'][0]
    return {
        "role_count": record["role_count"],
        "task_count": record["task_count"],
        "person_count": record["person_count"],
        "roles": record["roles"],
        "team_members": record["team_members"],
        "task_statuses": record["task_statuses"],
        "workspace_id": workspace_id,
        "timestamp": datetime.now().isoformat()
    }

def add_task_to_role(
    manager: Neo4jManager, 
    db_name: str, 
    role_name: str, 
    task_name: str,
    task_properties: Dict[str, Any] = None
) -> Dict[str, Any]:
    '''
     Add a new task to an existing role.

     find :
        manager (Neo4jManager)
        db_name (str)
        role_name (str)
        task_name (str)
        task_properties (Dict[str, Any], optional)
        
     Return : Dict[str, Any]
    '''
    # Prepare task properties
    base_properties = {
        "name": task_name,
        "type": "task",
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    if task_properties:
        base_properties.update(task_properties)

    # Create task node
    task_node = create_node(manager, db_name, "Task", base_properties)
    if not task_node:
        raise Exception(f"Failed to create task node: {task_name}")

    # Create relationship
    create_relationship(
        manager,
        db_name,
        "Role", role_name,
        "Task", task_name,
        "HAS_TASK",
        {"created_at": base_properties["created_at"]}
    )

    return {"task": task_node, "role": role_name}

def assign_task(
    manager: Neo4jManager,
    db_name: str,
    task_id: int,
    assignee_name: str
) -> bool:
    '''
     Assign a task to a person.

     find :
        manager (Neo4jManager)
        db_name (str)
        task_id (int)
        assignee_name (str)
        
     Return : bool
    '''
    # Delete existing assignment if any
    query_delete = """
    MATCH (t)-[r:ASSIGNED_TO]->()
    WHERE ID(t) = $task_id
    DELETE r
    """
    
    manager.execute_with_retry(db_name, query_delete, {"task_id": task_id})
    
    # Create new assignment
    query_assign = """
    MATCH (t), (p:Person {name: $assignee})
    WHERE ID(t) = $task_id
    CREATE (t)-[r:ASSIGNED_TO]->(p)
    SET r.created_at = $timestamp
    RETURN r
    """
    
    timestamp = datetime.now().isoformat()
    result = manager.execute_with_retry(
        db_name,
        query_assign,
        {
            "task_id": task_id,
            "assignee": assignee_name,
            "timestamp": timestamp
        }
    )
    
    return bool(result['data'])

def get_task_assignments(
    manager: Neo4jManager,
    db_name: str
) -> Dict[str, List[Dict[str, Any]]]:
    '''
     Get all task assignments grouped by person.

     find :
        manager (Neo4jManager)
        db_name (str)
        
     Return : Dict[str, List[Dict[str, Any]]]
    '''
    query = """
    MATCH (p:Person)<-[a:ASSIGNED_TO]-(t:Task)
    RETURN p.name as person,
           collect({
               task_id: ID(t),
               task_name: t.name,
               status: t.status,
               priority: t.priority,
               created_at: t.created_at
           }) as tasks
    """
    
    result = manager.execute_with_retry(db_name, query)
    assignments = {}
    
    for record in result['data']:
        assignments[record["person"]] = record["tasks"]
    
    return assignments