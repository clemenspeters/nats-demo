# Minimal NATS demo with Docker Compose

This demo runs a local NATS server and two Node.js services: a publisher and a subscriber.

Files:

- `docker-compose.yml` - defines the `nats`, `publisher`, and `subscriber` services.
- `publisher/` - Node app that publishes a message to subject `greet` every second.
- `subscriber/` - Node app that subscribes to `greet` and logs received messages.

How to run (macOS, Docker installed):

```bash
cd /Users/clemenspeters/projects/demos/nats-demo
# build and start
docker compose up --build
# in another terminal you can stop with Ctrl+C or run:
# docker compose down
```

Logs:

```bash
# show logs for all services
docker compose logs -f
# or just subscriber
docker compose logs -f subscriber
```

Notes:

- Services use `nats:latest` image from Docker Hub.
- The Node apps use the official `nats` npm client.
