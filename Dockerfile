FROM apache/airflow:2.10.4

# Install system dependencies with GPG signature verification workaround
USER root
RUN apt-get update -o Acquire::AllowInsecureRepositories=true \
    && apt-get install -y --no-install-recommends --allow-unauthenticated \
    curl \
    unzip \
    gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Terraform
RUN curl -LO https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip && \
    unzip terraform_1.5.7_linux_amd64.zip -d /usr/local/bin && \
    rm terraform_1.5.7_linux_amd64.zip

# Install Node.js 20 (LTS) instead of 16
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update -o Acquire::AllowInsecureRepositories=true && \
    apt-get install -y --allow-unauthenticated nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set PATH
ENV PATH=$PATH:/usr/local/bin

# Switch to airflow user
USER airflow
WORKDIR /opt/airflow/

# Copy package files for dependency installation
COPY --chown=airflow:airflow package.json package-lock.json ./
COPY --chown=airflow:airflow requirements.txt ./

# Install project dependencies
RUN npm install && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=airflow:airflow . .