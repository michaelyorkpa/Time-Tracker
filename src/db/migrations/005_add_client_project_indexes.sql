CREATE INDEX IF NOT EXISTS idx_clients_organization_status_updated
ON clients (organization_id, status, updated_at);

CREATE INDEX IF NOT EXISTS idx_projects_organization_client_status_updated
ON projects (organization_id, client_id, status, updated_at);

CREATE INDEX IF NOT EXISTS idx_projects_organization_status_updated
ON projects (organization_id, status, updated_at);
