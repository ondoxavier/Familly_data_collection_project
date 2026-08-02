// Exemple de transformation vers Neo4j après export CSV
// Adapter les chemins selon votre environnement Neo4j/import.

LOAD CSV WITH HEADERS FROM 'file:///persons.csv' AS row
MERGE (p:Person {id: row.id})
SET p.first_name = row.first_name,
    p.last_name = row.last_name,
    p.gender = row.gender,
    p.birth_date_text = row.birth_date_text,
    p.birth_place = row.birth_place,
    p.is_alive = row.is_alive,
    p.notes = row.notes;

LOAD CSV WITH HEADERS FROM 'file:///branches.csv' AS row
MERGE (b:Branch {id: row.id})
SET b.name = row.branch_name,
    b.root_person_name = row.root_person_name,
    b.status = row.status;

LOAD CSV WITH HEADERS FROM 'file:///persons.csv' AS row
MATCH (p:Person {id: row.id})
MATCH (b:Branch {id: row.branch_id})
MERGE (p)-[:BELONGS_TO_BRANCH]->(b);

LOAD CSV WITH HEADERS FROM 'file:///parent_child_links.csv' AS row
MATCH (parent:Person {id: row.parent_id})
MATCH (child:Person {id: row.child_id})
MERGE (parent)-[r:PARENT_OF]->(child)
SET r.link_type = row.link_type,
    r.certainty = row.certainty,
    r.notes = row.notes;

LOAD CSV WITH HEADERS FROM 'file:///unions.csv' AS row
MATCH (p1:Person {id: row.partner_1_id})
MATCH (p2:Person {id: row.partner_2_id})
MERGE (p1)-[r:SPOUSE_OF]->(p2)
SET r.union_type = row.union_type,
    r.start_date_text = row.start_date_text,
    r.end_date_text = row.end_date_text,
    r.notes = row.notes;
