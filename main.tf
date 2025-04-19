provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "api-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]

  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "ec2-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
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
    Name = "ec2-sg"
  }
}

resource "aws_instance" "api_server" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2 AMI
  instance_type = "t2.micro"
  subnet_id     = module.vpc.public_subnets[0]
  security_groups = [aws_security_group.ec2_sg.name]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y git
              curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
              sudo yum install -y nodejs
              git clone https://your-repo-url.git /home/ec2-user/app
              cd /home/ec2-user/app
              npm install
              npm start
              EOF

  tags = {
    Name = "api-server"
  }
}

resource "aws_lb" "api_alb" {
  name               = "api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ec2_sg.id]
  subnets            = module.vpc.public_subnets

  tags = {
    Name = "api-alb"
  }
}

resource "aws_lb_target_group" "api_tg" {
  name     = "api-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "api_listener" {
  load_balancer_arn = aws_lb.api_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
}

resource "aws_lb_target_group_attachment" "ec2_attachment" {
  target_group_arn = aws_lb_target_group.api_tg.arn
  target_id        = aws_instance.api_server.id
  port             = 80
}

# Optional Elastic IP (if you want static IP)
resource "aws_eip" "ec2_ip" {
  instance = aws_instance.api_server.id
  vpc      = true
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.api_alb.dns_name
}

output "instance_public_ip" {
  value = aws_instance.api_server.public_ip
}

output "elastic_ip" {
  value = aws_eip.ec2_ip.public_ip
}
