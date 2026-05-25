import { GeneratedFile } from '../types';
import { terraformLocalSubnetIds } from '../../../terraform-helpers';

export function generateRds(cfg: Record<string, any>, environment: string, projectName: string): GeneratedFile {
  const engine = cfg.engine || "postgres";
  const engineVersion = cfg.engine_version || "16";
  const instanceClass = cfg.instance_class || "db.t3.micro";
  const storage = cfg.allocated_storage || 20;
  const multiAz = cfg.multi_az === true;
  const backupRetention = cfg.backup_retention || 7;
  const port = engine === "postgres" ? 5432 : 3306;

  const content = `resource "aws_db_subnet_group" "main" {
  name       = "${'${var.project_name}-${var.environment}-db-subnet'}"
  subnet_ids = ${terraformLocalSubnetIds("private")}

  tags = {
    Name = "${'${var.project_name}-${var.environment}-db-subnet'}"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${'${var.project_name}-${var.environment}-rds-'}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = ${port}
    to_port         = ${port}
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr]
    description     = "Database access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${'${var.project_name}-${var.environment}-rds-sg'}"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${'${var.project_name}-${var.environment}-db'}"
  engine         = var.db_engine
  engine_version = "${engineVersion}"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = replace("${'${var.project_name}_${var.environment}'}", "-", "_")
  username = "dbadmin"
  password = "CHANGE_ME_IMMEDIATELY"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az                = ${multiAz}
  skip_final_snapshot     = ${environment !== "production"}
  backup_retention_period = ${backupRetention}

  tags = {
    Name = "${'${var.project_name}-${var.environment}-db'}"
  }
}`;

  return {
    name: "rds.tf",
    path: `${projectName}/rds.tf`,
    content,
    language: "hcl",
  };
}
