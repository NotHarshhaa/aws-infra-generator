<p align="center">
  <h1>🚀 AWS Infra Generator</h1>
</p>

<p align="center">
  <img src="public/banner.png" alt="AWS Infra Generator Banner" width="800" />
</p>

<p align="center">
  <strong>Design AWS infrastructure visually and generate production-ready Terraform or CloudFormation — no manual IaC writing required.</strong>
</p>

---

## What Is This Tool?

**AWS Infra Generator** is a browser-based platform engineering tool that helps you go from service selection to deployable infrastructure in minutes.

Pick the AWS services you need, configure them through a guided wizard, validate your setup, and export a ready-to-use IaC project — all without leaving your browser. No backend server required; everything runs client-side.

---

## How It Helps You

| Who | How it helps |
|-----|----------------|
| **DevOps & Platform Engineers** | Prototype stacks faster, standardize templates, and catch dependency issues before deploy |
| **Developers** | Learn AWS architecture patterns and generate correct IaC without starting from a blank file |
| **Startups & Small Teams** | Ship infra quickly without deep Terraform or CloudFormation expertise |
| **Consultants** | Produce consistent, documented infrastructure for client projects |

**In practice, you save time, reduce misconfiguration, and get clearer cost and architecture visibility before anything hits AWS.**

---

## How to Use It

### 1. Get started locally

```bash
git clone https://github.com/NotHarshhaa/aws-infra-generator.git
cd aws-infra-generator
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### 2. Follow the wizard

| Step | What you do |
|------|-------------|
| **Services** | Select AWS services (or start from a preset template) |
| **Configure** | Set project name, region, environment, output format, and per-service options |
| **Generate** | Validate and generate Terraform or CloudFormation files |
| **Export** | Preview, copy, or download everything as a ZIP |

### 3. Deploy

**Terraform:**

```bash
cd my-infra
terraform init
terraform plan
terraform apply
```

**CloudFormation:**

```bash
cd my-infra
aws cloudformation deploy \
  --template-file template.json \
  --stack-name my-infra-stack \
  --capabilities CAPABILITY_IAM
```

> **Tip:** If you change configuration after generating, the app will prompt you to **re-generate** before exporting — so your download always matches your latest settings.

---

## What Makes This Tool Incredible

### 🎯 End-to-end wizard, not just a code dump
A clear **Services → Configure → Generate → Export** flow with step navigation, validation gates, and progress you can trust.

### ☁️ 32+ AWS services, one unified experience
VPC, EC2, Lambda, ECS, EKS, S3, RDS, DynamoDB, ALB, API Gateway, IAM, SQS, SNS, CloudWatch, Step Functions, CodePipeline, and more — with **automatic dependency resolution** so related services are included for you.

### 📋 Preset architecture templates
Jump-start common patterns: web apps, serverless APIs, microservices, data pipelines, ML workloads, and static sites.

### 💰 Cost estimation built in
See **monthly and yearly** cost projections with per-service breakdowns before you deploy.

### 📊 Live infrastructure diagram
Interactive architecture view with service relationships, categories, and SVG export for docs and presentations.

### 🔍 Real Terraform plan preview
Plan output is **parsed from your actual generated `.tf` files** — see which resources will be created and key attributes before you download.

### ✅ Validation before generation
Dependency checks, config validation, and warnings — so you fix issues **before** generating code.

### 📦 Smart export
Download a ZIP with your IaC files, optional **README.md** and **`.gitignore`**, deploy commands, and file preview with copy/open actions.

### 🔒 Privacy-first & fast
Runs entirely in the browser. Your config stays on your machine. Generation is instant with no server round-trips.

### 💾 Session persistence
Wizard progress is saved locally — refresh the page and pick up where you left off.

---

## 🛠️ Author & Community

Built with passion and purpose by [**Harshhaa**](https://github.com/NotHarshhaa).  
Your ideas, feedback, and contributions are what make this project better.

Let's shape the future of cloud infrastructure together with AWS Infra Generator! 🚀

**Connect & Collaborate:**

* **GitHub:** [@NotHarshhaa](https://github.com/NotHarshhaa)
* **Blog:** [ProDevOpsGuy](https://blog.prodevopsguytech.com)
* **Telegram Community:** [Join Here](https://t.me/prodevopsguy)
* **LinkedIn:** [Harshhaa Vardhan Reddy](https://www.linkedin.com/in/NotHarshhaa/)

---

## ⭐ How You Can Support

If you found this project useful:

* ⭐ **Star** the repository to show your support
* 📢 **Share** it with your friends and colleagues
* 📝 **Open issues** or **submit pull requests** to help improve it

---

### 📢 Stay Connected

[![Follow Me](https://imgur.com/2j7GSPs.png)](https://github.com/NotHarshhaa)

Join the community, share your experience, and help us grow!
