# Team and Task Management System

A comprehensive system for managing teams, tasks, and document analysis using FastAPI backend and interactive web frontend.

## 🌟 Features

### 1. Document Analysis
- Upload and analyze multiple document types (PDF, TXT, MD)
- Extract roles and responsibilities
- Automated task generation from documents

### 2. Team Management
- Define team members and their roles
- Track member skills and experience
- Visualize team structure

### 3. Task Management
- Create and assign tasks
- Track task status and priority
- Estimate work hours
- Task lifecycle management

### 4. Graph Visualization
- Interactive network graph
- Multiple layout options
- Real-time updates
- Node and relationship visualization

## 🛠 Technology Stack

### Backend
- FastAPI
- Neo4j (Graph Database)
- LangChain
- GROQ/OpenAI for LLM integration
- Python 3.8+

### Frontend
- HTML5/JavaScript
- Tailwind CSS
- vis.js for graph visualization
- Vanilla JavaScript (No framework dependencies)

## 📋 Prerequisites

```bash
# Python 3.8+
python --version

# Neo4j Database
neo4j --version

# Node.js (optional, for development)
node --version
```

## ⚙️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd team-task-management
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (.env):
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_TOKEN=your-hf-token
```

4. Initialize Neo4j Database:
```bash
neo4j start
```

## 🚀 Running the Application

1. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

2. Open the web interface:
```bash
# Option 1: Using Python's built-in server
python -m http.server 5500

# Option 2: Using Node.js http-server
npx http-server -p 5500

# Option 3: Using VS Code Live Server
# Right-click on web_test.html and select "Open with Live Server"
```

3. Access the application:
```
http://localhost:5500/web_test.html
```

## 📖 Usage Guide

### Workspace Setup

1. Enter Workspace ID
2. Upload relevant documents
3. Define team structure:
```json
{
    "team_members": {
        "John Doe": {
            "current_role": "Software Developer",
            "skills": ["Python", "JavaScript", "Docker"],
            "experience": "5 years in web development"
        }
    }
}
```

### Task Management

1. Adding Tasks:
```plaintext
- Click "Add Task"
- Select role
- Enter task details
- Set priority and estimated hours
```

2. Task Status Updates:
```plaintext
- pending -> in_progress -> completed
- Update via task list or graph view
```

### Graph Visualization

1. Layout Options:
- Hierarchical: Shows organizational structure
- Force Directed: Shows relationships

2. Node Types:
```plaintext
- Person (Diamond): Team members
- Role (Circle): Job roles
- Task (Square): Work items
- Workspace (Triangle): Project workspace
```

## 🔄 API Endpoints

### Core Endpoints

```plaintext
POST /analyze
- Process documents and team analysis

GET /workspace/{workspace_id}/tasks
- Retrieve all tasks in workspace

PUT /workspace/{workspace_id}/node
- Update node properties

DELETE /workspace/{workspace_id}/node
- Delete node from graph
```

### Additional Endpoints

```plaintext
GET /health
- API health check

GET /workspace/{workspace_id}/graph
- Get graph visualization data

GET /workspace/{workspace_id}/statistics
- Get workspace statistics
```

## 🧪 Testing

1. Automated Tests:
```bash
python -m unittest tests/test_api.py
```

2. Web Interface Tests:
- Use the "API Tests" tab in the web interface
- Tests health check, analysis, and task operations

## 📚 Project Structure

```
project_root/
├── .env                     # Environment variables
├── main.py                 # FastAPI application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── web_test.html         # Web interface
└── src/
    ├── core/
    │   └── models.py     # Data models
    ├── services/
    │   ├── document_processor.py
    │   ├── team_analyzer.py
    │   ├── graph_manager.py
    │   └── llm_service.py
    └── utils/
        └── file_handler.py
```

## 🔒 Security Notes

- Set proper CORS policies in production
- Secure API endpoints
- Use environment variables for sensitive data
- Implement proper authentication in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- vis.js for graph visualization
- Tailwind CSS for styling
- FastAPI community
- Neo4j community