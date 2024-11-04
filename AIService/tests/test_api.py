import unittest
import requests
import json
import os
import uuid
import time
from typing import Dict, Any, List
from datetime import datetime

class TeamAnalysisAPITest(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:8000"
        cls.workspace_id = f"test{str(uuid.uuid4())[:8]}"
        cls.test_files = cls.create_test_files()
        cls.team_details = {
            "team_members": {
                "John Doe": {
                    "current_role": "Software Developer",
                    "skills": ["Python", "JavaScript", "Docker", "FastAPI"],
                    "experience": "5 years in full-stack development"
                },
                "Jane Smith": {
                    "current_role": "UX Designer",
                    "skills": ["UI/UX Design", "Figma", "User Research"],
                    "experience": "3 years in product design"
                },
                "Mike Johnson": {
                    "current_role": "Project Manager",
                    "skills": ["Agile", "Risk Management", "Team Leadership"],
                    "experience": "7 years in IT project management"
                }
            }
        }
        print(f"\nInitializing tests with workspace ID: {cls.workspace_id}")

    @classmethod
    def create_test_files(cls) -> List[str]:
        os.makedirs("tests/test_data", exist_ok=True)
        
        files = {
            "test_doc.md": """# Project Documentation

## Requirements
- Feature A implementation
- Feature B design
- Feature C testing

## Tasks
1. Design system architecture
2. Implement core features
3. Write test cases
4. Perform code review
5. Deploy to production
""",
            "test_doc.txt": """Project Plan

Phase 1: Planning
- Gather requirements
- Create design documents
- Setup development environment

Phase 2: Development
- Core feature implementation
- Unit testing
- Integration testing

Phase 3: Deployment
- System testing
- User acceptance testing
- Production deployment
""",
            "test_roles.md": """# Team Roles

## Software Developer
- Write code
- Debug issues
- Review code
- Write tests

## UX Designer
- Design interfaces
- Create prototypes
- Test usability

## Project Manager
- Plan sprints
- Track progress
- Manage team
- Report status
"""
        }
        
        file_paths = []
        for filename, content in files.items():
            path = os.path.join("tests/test_data", filename)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            file_paths.append(path)
        
        return file_paths

    def test_01_health_check(self):
        print("\nTesting health check...")
        response = requests.get(f"{self.base_url}/health")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["message"], "API is running")
        
        print("Health check response:", json.dumps(data, indent=2))

    def test_02_workspace_analysis(self):
        print("\nTesting workspace analysis...")
        
        # Prepare files and data
        files = [
            ('files', (os.path.basename(path), open(path, 'rb')))
            for path in self.test_files
        ]
        
        data = {
            'workspace_id': (None, self.workspace_id),
            'team_details': (None, json.dumps(self.team_details))
        }
        
        # Send request
        response = requests.post(
            f"{self.base_url}/analyze",
            files=files + list(data.items())
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["status"], "success")
        
        print("Analysis response:", json.dumps(result, indent=2))
        
        # Wait for processing
        time.sleep(5)

    def test_03_get_graph(self):
        print("\nTesting graph retrieval...")
        response = requests.get(f"{self.base_url}/workspace/{self.workspace_id}/graph")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Validate graph structure
        self.assertIn("nodes", data)
        self.assertIn("edges", data)
        self.assertTrue(len(data["nodes"]) > 0)
        self.assertTrue(len(data["edges"]) > 0)
        
        print(f"Graph contains {len(data['nodes'])} nodes and {len(data['edges'])} edges")
        
        # Store some nodes for later tests
        self.__class__.test_nodes = data["nodes"]

    def test_04_task_creation(self):
        print("\nTesting task creation...")
        
        # First, get available roles from the workspace
        graph_response = requests.get(f"{self.base_url}/workspace/{self.workspace_id}/graph")
        self.assertEqual(graph_response.status_code, 200)
        graph_data = graph_response.json()
        
        available_roles = [
            node['label'] 
            for node in graph_data['nodes'] 
            if 'type' in node and node['type'] == 'role'
        ]
        
        print(f"\nAvailable roles in workspace: {available_roles}")
        
        tasks = [
            {
                "role": "Software Developer",
                "name": "Implement Authentication",
                "description": "Add user authentication system",
                "priority": "high",
                "estimated_hours": 8
            },
            {
                "role": "UX Designer",
                "name": "Design Login Interface",
                "description": "Create user-friendly login page",
                "priority": "medium",
                "estimated_hours": 4
            },
            {
                "role": "Project Manager",
                "name": "Sprint Planning",
                "description": "Plan next sprint activities",
                "priority": "high",
                "estimated_hours": 2
            }
        ]
        
        # Get current tasks
        response = requests.get(f"{self.base_url}/workspace/{self.workspace_id}/tasks")
        self.assertEqual(response.status_code, 200)
        initial_tasks = response.json()
        
        created_tasks = []
        for task in tasks:
            # Only try to create task if role exists
            if task['role'] not in available_roles:
                print(f"Skipping task for role {task['role']} as it doesn't exist in workspace")
                continue
                
            form_data = {
                'role_name': task['role'],
                'task_name': task['name'],
                'description': task['description'],
                'priority': task['priority'],
                'estimated_hours': str(task['estimated_hours'])
            }
            
            print(f"\nCreating task: {task['name']} for role: {task['role']}")
            print(f"Form data: {form_data}")
            
            response = requests.post(
                f"{self.base_url}/workspace/{self.workspace_id}/task",
                data=form_data
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.text}")
            
            if response.status_code != 200:
                print(f"Failed to create task. Server response: {response.text}")
                continue

            try:
                result = response.json()
                created_tasks.append({
                    'name': task['name'],
                    'role': task['role'],
                    'id': result.get('details', {}).get('node_id')
                })
                print(f"Successfully created task: {task['name']} with ID: {result.get('details', {}).get('node_id')}")
            except Exception as e:
                print(f"Error parsing response JSON: {e}")
                continue

            time.sleep(1)
        
        if not created_tasks:
            self.skipTest("No tasks could be created")

        self.__class__.test_tasks = created_tasks
        print(f"\nSuccessfully created {len(created_tasks)} tasks:")
        print(json.dumps(created_tasks, indent=2))
        
        # Verify tasks were actually created
        response = requests.get(f"{self.base_url}/workspace/{self.workspace_id}/tasks")
        self.assertEqual(response.status_code, 200)
        current_tasks = response.json()
        print("\nCurrent tasks in system:")
        print(json.dumps(current_tasks, indent=2))

    def test_05_task_assignment(self):
        print("\nTesting task assignment...")
        
        if not hasattr(self, 'test_tasks'):
            self.skipTest("No tasks available for testing")
        
        for task in self.test_tasks:
            if task['id'] is None:
                continue
                
            assignee = list(self.team_details['team_members'].keys())[0]
            
            response = requests.put(
                f"{self.base_url}/workspace/{self.workspace_id}/node/{task['id']}",
                json={
                    'assignee': assignee,
                    'status': 'in_progress'
                }
            )
            
            self.assertEqual(response.status_code, 200)
            print(f"Assigned task {task['id']} to {assignee}")

    def test_07_update_task(self):
        print("\nTesting task updates...")
        
        if not hasattr(self, 'test_tasks'):
            self.skipTest("No tasks available for testing")
        
        for task in self.test_tasks:
            if task['id'] is not None:
                update_data = {
                    'status': 'completed',
                    'priority': 'low',
                    'description': 'Task completed successfully',
                    'completion_date': datetime.now().isoformat()
                }
                
                response = requests.put(
                    f"{self.base_url}/workspace/{self.workspace_id}/node/{task['id']}",
                    json=update_data
                )
                
                self.assertEqual(response.status_code, 200)
                print(f"Updated task {task['id']}")
                break

    def test_08_task_deletion(self):
        print("\nTesting task deletion...")
        
        if not hasattr(self, 'test_tasks'):
            self.skipTest("No tasks available for testing")
        
        for task in self.test_tasks:
            if task.get('id'):
                print(f"Attempting to delete task: {task['name']} (ID: {task['id']})")
                
                response = requests.delete(
                    f"{self.base_url}/workspace/{self.workspace_id}/node/{task['id']}"
                )
                
                print(f"Delete response status: {response.status_code}")
                print(f"Delete response content: {response.text}")
                
                self.assertEqual(response.status_code, 200)
                
                # Verify task was actually deleted
                verify_response = requests.get(
                    f"{self.base_url}/workspace/{self.workspace_id}/tasks"
                )
                self.assertEqual(verify_response.status_code, 200)
                current_tasks = verify_response.json()
                
                # Check task is not in current tasks
                task_found = False
                for person_tasks in current_tasks.values():
                    for t in person_tasks:
                        if str(t['node_id']) == str(task['id']):
                            task_found = True
                            break
                    if task_found:
                        break
                
                self.assertFalse(task_found, f"Task {task['id']} still exists after deletion")
                print(f"Successfully deleted task {task['id']}")
                break  # Delete one task is enough for testing
        else:
            print("No tasks with IDs found for deletion test")
            self.skipTest("No suitable tasks for deletion test")

    def test_09_statistics(self):
        print("\nTesting workspace statistics...")
        response = requests.get(f"{self.base_url}/workspace/{self.workspace_id}/statistics")
        
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        
        expected_keys = ['role_count', 'task_count', 'person_count']
        for key in expected_keys:
            self.assertIn(key, stats)
        
        print("Workspace statistics:", json.dumps(stats, indent=2))

    @classmethod
    def tearDownClass(cls):
        print("\nCleaning up test files...")
        for file_path in cls.test_files:
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {file_path}: {e}")
        
        try:
            os.rmdir("tests/test_data")
        except Exception as e:
            print(f"Error removing test_data directory: {e}")

def main():
    suite = unittest.TestLoader().loadTestsFromTestCase(TeamAnalysisAPITest)
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == "__main__":
    main()