# AWS Infrastructure Setup via Terraform

This folder contains the Terraform configuration to deploy your **student-note-books** project to AWS. 

## What This Creates:
1.  **Frontend**: An Amazon S3 bucket configured for Static Website Hosting. You will build your React app (`npm run build`) and upload the `dist` or `build` folder here.
2.  **Backend**: An Amazon EC2 instance (a virtual server) running Node.js. It opens port `5000` so your frontend can communicate with the backend API.

## Prerequisites
1.  **AWS Account**: You need an active AWS account.
2.  **AWS CLI**: Install the AWS Command Line Interface and run `aws configure`. Provide your AWS Access Key, Secret Key, and default region (e.g., `us-east-1`).
3.  **Terraform**: Install Terraform on your machine.

## How to Deploy Your Infrastructure
Open your terminal, navigate to this `terraform` folder, and run the following commands:

1.  **Initialize Terraform** (Downloads the AWS provider plugins):
    ```bash
    terraform init
    ```

2.  **See what will be created** (Optional but recommended):
    ```bash
    terraform plan
    ```

3.  **Deploy the infrastructure**:
    ```bash
    terraform apply
    ```
    Type `yes` when prompted.

## Next Steps After Deployment

When the deployment finishes, Terraform will output three values:
- `backend_api_url`
- `backend_server_public_ip`
- `frontend_website_url`

### 1. Backend Setup
1. Look into the `ec2.tf` file. Inside the `user_data` block, you'll see a bash script. You'll need to update it with your actual GitHub repository URL.
2. The virtual server automatically installs Node.js. You'll need to SSH into the server or let the script run `git clone`, `npm install`, and start your backend via `pm2 start server.js`.

### 2. Frontend Setup
1. In your `frontend` folder, update your API connection URLs to point to your new `backend_api_url` (e.g., `http://1.2.3.4:5000`).
2. Run `npm run build` in your `frontend` directory.
3. Upload the generated files inside the `build`/`dist` folder directly into the newly created S3 bucket using the AWS Console or the AWS CLI:
   ```bash
   aws s3 sync build/ s3://<your-bucket-name>
   ```
4. Visit `frontend_website_url` in your browser.

## To Tear Down / Delete Everything
To stop incurring charges and delete all created resources:
```bash
terraform destroy
```
