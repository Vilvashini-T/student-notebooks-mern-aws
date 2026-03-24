output "frontend_website_url" {
  description = "URL of the S3 static website hosting the frontend"
  value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

output "backend_server_public_ip" {
  description = "Public IP of the EC2 instance hosting the backend"
  value       = aws_instance.backend_server.public_ip
}

output "backend_api_url" {
  description = "URL for the backend API (HTTP)"
  value       = "http://${aws_instance.backend_server.public_ip}:5000"
}
