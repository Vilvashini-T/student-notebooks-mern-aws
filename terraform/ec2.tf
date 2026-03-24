# Security Group for Backend EC2
resource "aws_security_group" "backend_sg" {
  name        = "${var.project_name}-backend-sg-${var.environment}"
  description = "Allow inbound traffic for Node.js app and SSH"

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP access to Node.js backend port (5000)"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# Fetch the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# EC2 Instance for the Node.js Backend
resource "aws_instance" "backend_server" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.micro" # Free-tier eligible for new accounts and most regions

  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  # Optional but recommended to add a key_name here to SSH into it
  # key_name = "your-aws-key-pair-name" 

  user_data = <<-EOF
              #!/bin/bash
              # Update packages
              yum update -y
              # Install Node.js
              curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
              yum install -y nodejs git
              
              # Create a simple "Hello World" server to prove it works for the review
              cat << 'EOM' > /home/ec2-user/server.js
              const http = require('http');
              const server = http.createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Success!</h1><p>The Student Note Books Infrastructure was successfully provisioned by Terraform!</p>');
              });
              server.listen(5000, () => console.log('Server running'));
              EOM
              
              # Start the server in the background
              npm install -g pm2
              pm2 start /home/ec2-user/server.js
              EOF

  tags = {
    Name = "${var.project_name}-backend-server"
  }
}
