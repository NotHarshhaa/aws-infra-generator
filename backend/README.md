# AWS Infra Generator Backend

FastAPI backend for generating AWS infrastructure templates (Terraform and CloudFormation).

## Features

- 🏗️ **Infrastructure Generation**: Generate Terraform and CloudFormation templates
- ✅ **Validation**: Validate infrastructure configurations with dependency checking
- 📦 **ZIP Export**: Download generated files as ZIP archives
- 🔒 **Input Validation**: Comprehensive request validation with Pydantic
- 📝 **Logging**: Structured logging for debugging and monitoring
- 🏥 **Health Checks**: Comprehensive health monitoring
- 🔧 **Environment Configuration**: Flexible configuration via environment variables

## API Endpoints

### Health & Info
- `GET /` - API information and documentation links
- `GET /api/health` - Comprehensive health check with component status

### Core Operations
- `POST /api/validate` - Validate infrastructure configuration
- `POST /api/generate` - Generate infrastructure templates
- `POST /api/download` - Download templates as ZIP file

## Supported AWS Services

- **VPC** - Virtual Private Cloud
- **EC2** - Elastic Compute Cloud
- **S3** - Simple Storage Service
- **RDS** - Relational Database Service
- **ALB** - Application Load Balancer
- **IAM** - Identity and Access Management

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

## Running the Server

### Quick Start
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:3001` | CORS allowed origins (comma-separated) |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |

## Request Validation

The API includes comprehensive validation:

### Services Validation
- At least one service must be selected
- Only supported services are allowed
- Valid services: `vpc`, `ec2`, `s3`, `rds`, `alb`, `iam`

### Environment Validation
- Must be one of: `development`, `staging`, `production`

### Format Validation
- Must be one of: `terraform`, `cloudformation`

### Project Name Validation
- Cannot be empty
- Maximum 50 characters
- Whitespace trimmed

## Example Usage

### Validate Infrastructure
```bash
curl -X POST "http://localhost:8000/api/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["vpc", "ec2"],
    "config": {
      "vpc": {
        "enabled": true,
        "config": {
          "cidr_block": "10.0.0.0/16"
        }
      }
    }
  }'
```

### Generate Templates
```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["vpc", "ec2"],
    "config": {},
    "environment": "development",
    "region": "us-east-1",
    "format": "terraform",
    "projectName": "my-infra"
  }'
```

### Download ZIP
```bash
curl -X POST "http://localhost:8000/api/download" \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["vpc", "ec2"],
    "config": {},
    "environment": "development",
    "region": "us-east-1",
    "format": "terraform",
    "projectName": "my-infra"
  }' \
  --output my-infra-terraform.zip
```

## Error Handling

The API provides detailed error responses:

```json
{
  "detail": "Validation failed: At least one service must be selected"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failures)

## Logging

The backend provides structured logging with:
- Request/response logging
- Error tracking
- Component status monitoring
- Performance metrics

Log format:
```
INFO:__main__:Validating infrastructure for services: ['vpc', 'ec2']
INFO:__main__:Validation completed. Valid: True, Errors: 0, Warnings: 1
```

## Architecture

```
backend/
├── main.py              # FastAPI application and endpoints
├── services/
│   ├── validator.py     # Infrastructure validation logic
│   └── dependency.py    # Service dependency resolution
├── generator/
│   ├── terraform.py     # Terraform template generator
│   └── cloudformation.py # CloudFormation template generator
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── start.bat           # Windows startup script
└── start.sh            # Linux/Mac startup script
```

## Development

### Adding New Services

1. **Update dependency map** in `services/dependency.py`
2. **Add validation rules** in `services/validator.py`
3. **Implement generators** in `generator/terraform.py` and `generator/cloudformation.py`
4. **Update validation** in `main.py` request models

### Testing

Run health check to verify all components:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000",
  "version": "1.0.0",
  "components": {
    "validator": "ok",
    "dependency_resolver": "ok",
    "terraform_generator": "ok",
    "cloudformation_generator": "ok"
  }
}
```

## Security Considerations

- **CORS**: Configured for specific origins in production
- **Input Validation**: All requests validated with Pydantic
- **Error Handling**: No sensitive information leaked in error messages
- **Logging**: No sensitive data logged (configurations are filtered)

## Performance

- **Dependency Resolution**: Efficient graph-based resolution
- **Template Generation**: Optimized Jinja2 templating
- **ZIP Creation**: Streaming response for large files
- **Validation**: Cached dependency lookups

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Template Issues**: Generator falls back to inline templates if templates directory missing
3. **CORS Issues**: Check `ALLOWED_ORIGINS` environment variable
4. **Port Conflicts**: Change port with `--port` flag

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
uvicorn main:app --reload
```

## License

This project is part of the AWS Infra Generator toolkit.
