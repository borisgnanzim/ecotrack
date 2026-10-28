# Docker Hub Deployment

## What gets pushed
- Custom backend microservices
- Custom frontend images
- Infrastructure images stay on Docker Hub official/public registries (`postgres`, `redis`, `confluentinc/cp-kafka`, `confluentinc/cp-zookeeper`)

## Required secrets in GitHub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Required env file on the VM
Copy `.env.dockerhub.example` to `.env` and fill:
- `DOCKERHUB_USERNAME`
- `IMAGE_TAG`
- `JWT_SECRET`
- database and Redis passwords if you want custom values

## Deploy on a VM/VPS
1. Install Docker and Docker Compose.
2. Log in to Docker Hub on the VM if pulling private images: `docker login`.
3. Copy the repo or just the compose files and `.env` to the VM.
4. Start the stack:

```bash
docker compose -f docker-compose.dockerhub.yml --env-file .env up -d
```

## Update flow
1. Push to `main` or run the workflow manually.
2. The CI publishes new image tags to Docker Hub.
3. On the VM, pull the new images:

```bash
docker compose -f docker-compose.dockerhub.yml --env-file .env pull
docker compose -f docker-compose.dockerhub.yml --env-file .env up -d
```

## Notes
- Kafka host exposure uses `19092` to avoid Windows reserved port ranges.
- All containers communicate through Docker service names, never `localhost`.