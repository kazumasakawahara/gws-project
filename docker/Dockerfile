FROM node:18-bullseye

# Install Google Workspace CLI
RUN npm install -g @googleworkspace/cli

# Copy the MCP server wrapper
WORKDIR /app
COPY package.json ./
COPY src/ ./src/
COPY bin/ ./bin/

WORKDIR /root
ENTRYPOINT ["node", "/app/bin/gws-mcp"]
