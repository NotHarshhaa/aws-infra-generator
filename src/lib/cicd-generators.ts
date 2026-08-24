import { OutputFormat, Environment } from "./types";

export interface CicdPipeline {
  id: string;
  name: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export function generateGithubActionsWorkflow(params: {
  projectName: string;
  environment: Environment;
  region: string;
  outputFormat: OutputFormat;
}): string {
  const { projectName, environment, region, outputFormat } = params;

  if (outputFormat === "terraform") {
    return `# .github/workflows/deploy.yml
# Automated Terraform Pipeline for ${projectName} (${environment})
name: "Terraform Infrastructure Deploy"

on:
  push:
    branches:
      - main
      - ${environment}
  pull_request:
    branches:
      - main

permissions:
  id-token: write   # Required for AWS OIDC authentication
  contents: read
  pull-requests: write

env:
  AWS_REGION: "${region}"
  TF_VERSION: "1.7.5"
  ENVIRONMENT: "${environment}"

jobs:
  terraform-plan:
    name: "Terraform Lint, Security & Plan"
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: \${{ env.TF_VERSION }}

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::\${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-${projectName}-deploy
          aws-region: \${{ env.AWS_REGION }}

      - name: Terraform Format Check
        id: fmt
        run: terraform fmt -check

      - name: Terraform Init
        id: init
        run: terraform init -backend-config="bucket=${projectName}-tfstate"

      - name: Terraform Validate
        id: validate
        run: terraform validate

      - name: Run TFLint
        uses: terraform-linters/setup-tflint@v4
        with:
          tflint_version: v0.50.0

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: false

      - name: Comment Plan on PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const output = \`#### Terraform Validation 🤖\\\`\${{ steps.validate.outcome }}\\\`
            #### Terraform Plan 📖\\\`\${{ steps.plan.outcome }}\\\`

            *Pushed by: @\${{ github.actor }}, Action: \\\`\${{ github.event_name }}\\\`*\`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  terraform-apply:
    name: "Terraform Apply"
    needs: terraform-plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: ${environment}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: \${{ env.TF_VERSION }}

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::\${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-${projectName}-deploy
          aws-region: \${{ env.AWS_REGION }}

      - name: Terraform Init
        run: terraform init

      - name: Terraform Apply
        run: terraform apply -auto-approve
`;
  }

  if (outputFormat === "cdk") {
    return `# .github/workflows/deploy.yml
# Automated AWS CDK Pipeline for ${projectName} (${environment})
name: "AWS CDK Infrastructure Deploy"

on:
  push:
    branches: [main, ${environment}]
  pull_request:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  cdk-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::\${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-${projectName}-cdk
          aws-region: "${region}"

      - name: CDK Synth & Diff
        run: npx cdk diff

      - name: CDK Deploy
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: npx cdk deploy --require-approval never
`;
  }

  return `# .github/workflows/deploy.yml
# Automated CloudFormation Pipeline for ${projectName} (${environment})
name: "CloudFormation Infrastructure Deploy"

on:
  push:
    branches: [main, ${environment}]

permissions:
  id-token: write
  contents: read

jobs:
  cfn-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::\${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-${projectName}-cfn
          aws-region: "${region}"

      - name: Validate CloudFormation Template
        run: |
          aws cloudformation validate-template --template-body file://template.json

      - name: Deploy CloudFormation Stack
        run: |
          aws cloudformation deploy \\
            --template-file template.json \\
            --stack-name "${projectName}-${environment}" \\
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \\
            --parameter-overrides Environment="${environment}"
`;
}

export function generateGitlabCiPipeline(params: {
  projectName: string;
  environment: Environment;
  region: string;
  outputFormat: OutputFormat;
}): string {
  const { projectName, environment, region, outputFormat } = params;

  if (outputFormat === "terraform") {
    return `# .gitlab-ci.yml - GitLab CI Pipeline for ${projectName}
image:
  name: hashicorp/terraform:1.7.5
  entrypoint: [""]

variables:
  AWS_DEFAULT_REGION: "${region}"
  TF_ROOT: \${CI_PROJECT_DIR}

stages:
  - validate
  - plan
  - apply

before_script:
  - cd \${TF_ROOT}
  - terraform --version
  - terraform init

validate:
  stage: validate
  script:
    - terraform fmt -check
    - terraform validate

plan:
  stage: plan
  script:
    - terraform plan -out=tfplan
  artifacts:
    name: "plan"
    paths:
      - tfplan

apply:
  stage: apply
  script:
    - terraform apply -auto-approve tfplan
  dependencies:
    - plan
  when: manual
  only:
    - main
`;
  }

  return `# .gitlab-ci.yml - GitLab CI Pipeline for ${projectName} (${outputFormat})
image: amazon/aws-cli:latest

variables:
  AWS_DEFAULT_REGION: "${region}"

stages:
  - validate
  - deploy

validate:
  stage: validate
  script:
    - aws cloudformation validate-template --template-body file://template.json

deploy:
  stage: deploy
  script:
    - aws cloudformation deploy --template-file template.json --stack-name "${projectName}-${environment}" --capabilities CAPABILITY_IAM
  when: manual
  only:
    - main
`;
}

export function generateCodeBuildSpec(params: {
  projectName: string;
  environment: Environment;
  outputFormat: OutputFormat;
}): string {
  const { projectName, outputFormat } = params;

  if (outputFormat === "terraform") {
    return `# buildspec.yml - AWS CodeBuild specification for ${projectName}
version: 0.2

phases:
  install:
    commands:
      - echo "Installing Terraform..."
      - curl -s -qL -o terraform.zip https://releases.hashicorp.com/terraform/1.7.5/terraform_1.7.5_linux_amd64.zip
      - unzip -o terraform.zip -d /usr/local/bin
      - terraform version
  pre_build:
    commands:
      - echo "Initializing Terraform..."
      - terraform init
      - terraform validate
  build:
    commands:
      - echo "Running Terraform Plan & Apply..."
      - terraform plan -out=tfplan
      - terraform apply -auto-approve tfplan
`;
  }

  return `# buildspec.yml - AWS CodeBuild specification for ${projectName}
version: 0.2

phases:
  pre_build:
    commands:
      - echo "Validating template..."
      - aws cloudformation validate-template --template-body file://template.json
  build:
    commands:
      - echo "Deploying CloudFormation stack..."
      - aws cloudformation deploy --template-file template.json --stack-name "${projectName}" --capabilities CAPABILITY_IAM
`;
}

export function getAllCicdPipelines(params: {
  projectName: string;
  environment: Environment;
  region: string;
  outputFormat: OutputFormat;
}): CicdPipeline[] {
  return [
    {
      id: "github-actions",
      name: "GitHub Actions",
      filename: ".github/workflows/deploy.yml",
      language: "yaml",
      description: "AWS OIDC role auth, PR comments, linting & deployment",
      content: generateGithubActionsWorkflow(params),
    },
    {
      id: "gitlab-ci",
      name: "GitLab CI/CD",
      filename: ".gitlab-ci.yml",
      language: "yaml",
      description: "Stage-based validation, plan artifacts & manual production approval gates",
      content: generateGitlabCiPipeline(params),
    },
    {
      id: "codebuild",
      name: "AWS CodeBuild",
      filename: "buildspec.yml",
      language: "yaml",
      description: "Native AWS CodePipeline / CodeBuild phase execution specification",
      content: generateCodeBuildSpec(params),
    },
  ];
}
