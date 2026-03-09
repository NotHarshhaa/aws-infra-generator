from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import io
import zipfile

from generator.terraform import TerraformGenerator
from generator.cloudformation import CloudFormationGenerator
from services.validator import InfraValidator
from services.dependency import DependencyResolver

app = FastAPI(
    title="AWS Infra Generator API",
    description="Generate Terraform and CloudFormation templates from AWS service selections",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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


class ValidateRequest(BaseModel):
    services: List[str]
    config: Dict[str, ServiceConfigModel] = {}


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
    return {"message": "AWS Infra Generator API", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.post("/api/validate", response_model=ValidationResult)
def validate_infrastructure(req: ValidateRequest):
    validator = InfraValidator()
    resolver = DependencyResolver()

    resolved_services = resolver.resolve(req.services)
    config_dict = {k: v.model_dump() for k, v in req.config.items()}
    result = validator.validate(resolved_services, config_dict)

    return result


@app.post("/api/generate", response_model=GenerateResponse)
def generate_infrastructure(req: GenerateRequest):
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

    return GenerateResponse(files=files, validation=validation)


@app.post("/api/download")
def download_infrastructure(req: GenerateRequest):
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

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            zf.writestr(f["path"], f["content"])

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{req.projectName}-{req.format}.zip"'
        },
    )
