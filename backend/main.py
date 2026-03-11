from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from typing import Dict, Any, List, Optional
import io
import zipfile
import logging
import os
from datetime import datetime

from generator.terraform import TerraformGenerator
from generator.cloudformation import CloudFormationGenerator
from services.validator import InfraValidator
from services.dependency import DependencyResolver

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AWS Infra Generator API",
    description="Generate Terraform and CloudFormation templates from AWS service selections",
    version="1.0.0",
)

# Configure CORS for production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ServiceConfigModel(BaseModel):
    enabled: bool = True
    config: Dict[str, Any] = {}


class GenerateRequest(BaseModel):
    services: List[str]
    config: Dict[str, ServiceConfigModel] = {}
    environment: str = "development"
    region: str = "us-east-1"
    format: str = "terraform"
    projectName: str = "my-infra"

    @field_validator('services')
    @classmethod
    def validate_services(cls, v):
        if not v:
            raise ValueError('At least one service must be selected')
        
        valid_services = ['vpc', 'ec2', 's3', 'rds', 'alb', 'iam', 'lambda', 'api-gateway', 'cloudfront', 'ecs', 'eks', 'dynamodb', 'elasticache', 'sqs', 'sns', 'cloudwatch']
        for service in v:
            if service not in valid_services:
                raise ValueError(f'Invalid service: {service}')
        return v

    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v):
        valid_envs = ['development', 'staging', 'production']
        if v not in valid_envs:
            raise ValueError(f'Invalid environment: {v}')
        return v

    @field_validator('format')
    @classmethod
    def validate_format(cls, v):
        valid_formats = ['terraform', 'cloudformation']
        if v not in valid_formats:
            raise ValueError(f'Invalid format: {v}')
        return v

    @field_validator('projectName')
    @classmethod
    def validate_project_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Project name cannot be empty')
        if len(v) > 50:
            raise ValueError('Project name must be less than 50 characters')
        return v.strip()


class ValidateRequest(BaseModel):
    services: List[str]
    config: Dict[str, ServiceConfigModel] = {}

    @field_validator('services')
    @classmethod
    def validate_services(cls, v):
        if not v:
            raise ValueError('At least one service must be selected')
        
        valid_services = ['vpc', 'ec2', 's3', 'rds', 'alb', 'iam', 'lambda', 'api-gateway', 'cloudfront', 'ecs', 'eks', 'dynamodb', 'elasticache', 'sqs', 'sns', 'cloudwatch']
        for service in v:
            if service not in valid_services:
                raise ValueError(f'Invalid service: {service}')
        return v


class GeneratedFile(BaseModel):
    name: str
    path: str
    content: str
    language: str


class ValidationError(BaseModel):
    service: str
    message: str
    type: str


class ValidationWarning(BaseModel):
    service: str
    message: str


class ValidationResult(BaseModel):
    valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationWarning]


class GenerateResponse(BaseModel):
    files: List[GeneratedFile]
    validation: ValidationResult


@app.get("/")
def root():
    return {
        "message": "AWS Infra Generator API", 
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def health():
    """Comprehensive health check endpoint."""
    try:
        # Test basic functionality
        validator = InfraValidator()
        resolver = DependencyResolver()
        terraform_gen = TerraformGenerator()
        cloudformation_gen = CloudFormationGenerator()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "components": {
                "validator": "ok",
                "dependency_resolver": "ok",
                "terraform_generator": "ok",
                "cloudformation_generator": "ok"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unavailable: {str(e)}"
        )


@app.post("/api/validate", response_model=ValidationResult)
def validate_infrastructure(req: ValidateRequest):
    """Validate infrastructure configuration."""
    try:
        logger.info(f"Validating infrastructure for services: {req.services}")
        
        validator = InfraValidator()
        resolver = DependencyResolver()

        resolved_services = resolver.resolve(req.services)
        config_dict = {k: v.model_dump() for k, v in req.config.items()}
        result = validator.validate(resolved_services, config_dict)

        logger.info(f"Validation completed. Valid: {result['valid']}, Errors: {len(result['errors'])}, Warnings: {len(result['warnings'])}")
        return result
        
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )


@app.post("/api/generate", response_model=GenerateResponse)
def generate_infrastructure(req: GenerateRequest):
    """Generate infrastructure templates."""
    try:
        logger.info(f"Generating {req.format} templates for project: {req.projectName}, services: {req.services}")
        
        validator = InfraValidator()
        resolver = DependencyResolver()

        resolved_services = resolver.resolve(req.services)
        config_dict = {k: v.model_dump() for k, v in req.config.items()}

        validation = validator.validate(resolved_services, config_dict)

        if req.format == "terraform":
            generator = TerraformGenerator()
        else:
            generator = CloudFormationGenerator()

        files = generator.generate(
            services=resolved_services,
            config=config_dict,
            environment=req.environment,
            region=req.region,
            project_name=req.projectName,
        )

        logger.info(f"Generated {len(files)} files for {req.format}")
        return GenerateResponse(files=files, validation=validation)
        
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )


@app.post("/api/download")
def download_infrastructure(req: GenerateRequest):
    """Download infrastructure templates as ZIP file."""
    try:
        logger.info(f"Downloading {req.format} templates for project: {req.projectName}")
        
        resolver = DependencyResolver()
        resolved_services = resolver.resolve(req.services)
        config_dict = {k: v.model_dump() for k, v in req.config.items()}

        if req.format == "terraform":
            generator = TerraformGenerator()
        else:
            generator = CloudFormationGenerator()

        files = generator.generate(
            services=resolved_services,
            config=config_dict,
            environment=req.environment,
            region=req.region,
            project_name=req.projectName,
        )

        # Create ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in files:
                zf.writestr(f["path"], f["content"])

        zip_buffer.seek(0)

        filename = f"{req.projectName}-{req.format}.zip"
        logger.info(f"Created ZIP file: {filename} with {len(files)} files")

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(zip_buffer.getbuffer().nbytes)
            },
        )
        
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}"
        )
