from neo4j import GraphDatabase

class Neo4jCRUD:

    """
    A class to perform basic CRUD operations on a Neo4j graph database, including
    creating nodes, relationships, and retrieving the entire graph.
    """

    def __init__(self, uri, user, password, db_name):

        """
        Initialize the Neo4j driver with the given URI, username, password, and database name.
        If the database does not exist, create it.

        Args:
            uri (str): The URI of the Neo4j database.
            user (str): The username for authentication.
            password (str): The password for authentication.
            db_name (str): The name of the database to connect to or create.
        """
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.db_name = db_name
        self._create_database_if_not_exists()

    def close(self):

        """Close the Neo4j database connection."""
        self.driver.close()

    def _create_database_if_not_exists(self):

        """Create the database if it does not exist."""
        with self.driver.session() as session:
            existing_databases = session.run("SHOW DATABASES")
            if not any(db["name"] == self.db_name for db in existing_databases):
                session.run(f"CREATE DATABASE {self.db_name}")

    def create_node(self, label, properties):

        """
        Create a node with the given label and properties.

        Args:
            label (str): The label of the node (e.g., "Person").
            properties (dict): The properties of the node (e.g., {"name": "Alice", "age": 30}).
        """
        with self.driver.session(database=self.db_name) as session:
            session.execute_write(self._create_and_return_node, label, properties)

    def get_node_by_name(self, label, name):

        """
        Retrieve a node by its name.

        Args:
            label (str): The label of the node.
            name (str): The name property of the node.
        """
        with self.driver.session(database=self.db_name) as session:
            result = session.execute_read(self._get_node, label, name)
            for record in result:
                print(record)

    def update_node(self, label, name, new_properties):
        
        """
        Update a node's properties by its name.

        Args:
            label (str): The label of the node.
            name (str): The name property of the node to identify it.
            new_properties (dict): The new properties to update the node with.
        """
        with self.driver.session(database=self.db_name) as session:
            session.execute_write(self._update_and_return_node, label, name, new_properties)

    def delete_node(self, label, name):

        """
        Delete a node by its name.

        Args:
            label (str): The label of the node.
            name (str): The name property of the node to delete.
        """
        with self.driver.session(database=self.db_name) as session:
            session.execute_write(self._delete_node, label, name)

    def create_relationship(self, label1, name1, label2, name2, rel_type, rel_properties=None):

        """
        Create a relationship between two nodes.

        Args:
            label1 (str): The label of the first node.
            name1 (str): The name of the first node.
            label2 (str): The label of the second node.
            name2 (str): The name of the second node.
            rel_type (str): The type of relationship (e.g., "FRIENDS_WITH").
            rel_properties (dict, optional): Additional properties for the relationship.
        """
        with self.driver.session(database=self.db_name) as session:
            session.execute_write(self._create_and_return_relationship, label1, name1, label2, name2, rel_type, rel_properties)

    def get_graph(self):

        """Get All Graph"""
        with self.driver.session(database=self.db_name) as session:
            return session.execute_read(self._get_graph)

    def _get_graph(self, tx):
        query = "MATCH (n)-[r]->(m) RETURN n, r, m"
        return list(tx.run(query))

    def _create_and_return_node(self, tx, label, properties):
        query = f"CREATE (n:{label} $properties) RETURN n"
        return tx.run(query, properties=properties)

    def _get_node(self, tx, label, name):
        query = f"MATCH (n:{label} {{name: $name}}) RETURN n"
        return tx.run(query, name=name)

    def _update_and_return_node(self, tx, label, name, new_properties):
        query = f"MATCH (n:{label} {{name: $name}}) SET n += $new_properties RETURN n"
        return tx.run(query, name=name, new_properties=new_properties)

    def _delete_node(self, tx, label, name):
        query = f"MATCH (n:{label} {{name: $name}}) DELETE n"
        tx.run(query, name=name)

    def _create_and_return_relationship(self, tx, label1, name1, label2, name2, rel_type, rel_properties):
        query = f"""
        MATCH (a:{label1} {{name: $name1}}), (b:{label2} {{name: $name2}})
        CREATE (a)-[r:{rel_type} $rel_properties]->(b)
        RETURN a, r, b
        """
        return tx.run(query, name1=name1, name2=name2, rel_properties=rel_properties or {})
    
# ==================================================================================================
# |Test Run Me | Test Run Me | Test Run Me | Test Run Me | Test Run Me | Test Run Me | Test Run Me |
# ==================================================================================================

if __name__ == "__main__":
    db = Neo4jCRUD("neo4j://localhost:7687", "neo4j", "neo4j", "mydatabaseaabc")
    db.create_node("Person", {"name": "Alice", "age": 30})
    db.create_node("Person", {"name": "Bob", "age": 25})
    db.create_relationship("Person", "Alice", "Person", "Bob", "FRIENDS_WITH", {"since": 2021})
    db.get_graph()
    db.close()
