# 🚀 AWS Infra Generator

**aws-infra-generator** is a platform engineering tool that allows users to design AWS infrastructure through a simple interface and automatically generate **Infrastructure as Code (IaC)** templates using **Terraform** or **AWS CloudFormation**.

Instead of manually writing infrastructure code, users can select the AWS services they need and instantly generate production-ready infrastructure templates.

---

## ✨ Features

- **Infrastructure Template Generation** — Generate Terraform or CloudFormation templates automatically
- **AWS Service Selection** — Choose from VPC, EC2, S3, RDS, ALB, IAM
- **Service Dependency Engine** — Auto-resolves dependencies (e.g., ALB → VPC + Subnets + Security Groups)
- **Multi-Environment Support** — Generate for development, staging, or production
- **Infrastructure Validation** — Validates dependencies, config conflicts, and missing resources
- **Export & Download** — Download generated templates as a ZIP archive

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Infrastructure Generation | Client-side TypeScript (Terraform & CloudFormation) |
| Template Engine | TypeScript template builders |
| Packaging | Browser-based ZIP export (JSZip) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/NotHarshhaa/aws-infra-generator.git
cd aws-infra-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

**Note**: This application runs entirely in the browser without requiring a backend server. All infrastructure generation happens client-side using TypeScript implementations.

---

## 🖥 Example Workflow

### 1. Select Infrastructure

Choose services like VPC, EC2, RDS, S3 from the UI.

### 2. Configure Options

```
Region: us-east-1
EC2 Instance Type: t3.medium
EC2 Count: 3
Database Engine: PostgreSQL
Environment: production
```

### 3. Generate Infrastructure

The tool generates a complete project structure:

**Terraform output:**
```
my-infra/
├── main.tf
├── variables.tf
├── vpc.tf
├── ec2.tf
├── rds.tf
├── s3.tf
└── outputs.tf
```

**CloudFormation output:**
```
my-infra/
└── template.json
```

### 4. Deploy

```bash
# Terraform
cd my-infra
terraform init
terraform plan
terraform apply

# CloudFormation
aws cloudformation deploy \
  --template-file template.json \
  --stack-name my-infra-stack \
  --capabilities CAPABILITY_IAM
```

---

## 📡 Client-side Functions

| Function | Description |
|----------|-------------|
| `generateInfrastructure()` | Generate IaC templates locally |
| `validateInfrastructure()` | Validate infrastructure config locally |
| `downloadInfrastructure()` | Download as ZIP archive (browser) |

---

## 🏗 Architecture

```
Frontend UI (Next.js + shadcn/ui)
        ↓
Client-side Infrastructure Generation (TypeScript)
        ↓
Terraform / CloudFormation Builders
        ↓
Browser-based ZIP Download
```

---

## 🚀 Roadmap

- [ ] Infrastructure cost estimation
- [ ] Terraform plan preview
- [ ] Infrastructure visualization (diagram)
- [ ] GitOps integration
- [ ] Multi-cloud support (Azure / GCP)
- [ ] Service architecture templates
- [ ] AWS CDK output support

---

## 👨‍💻 Use Cases

- DevOps engineers designing infrastructure
- Platform engineering teams building internal tools
- Developers learning cloud architecture
- Rapid infrastructure prototyping

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
