# Deployment Checklist

## 服务器要求

- Ubuntu 22.04/24.04
- 2C4G 可测试，4C8G 推荐
- Docker + Docker Compose
- 开放端口：80、443

## 首次部署

```bash
git clone <repo-url> agathon-edu
cd agathon-edu
cp .env.example .env
```

编辑 `.env`：

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-chat
DATABASE_URL=postgresql://agathon:change-me@postgres:5432/agathon_edu
CORS_ORIGINS=https://你的域名
```

启动：

```bash
docker compose up -d --build
```

测试：

```bash
curl http://127.0.0.1:8080/
curl http://127.0.0.1:8080/api/health
curl http://127.0.0.1:8080/api/teacher/summary
```

## 域名与 HTTPS

生产建议把公网 80/443 指向一层宿主机 Nginx，再反代到：

```text
http://127.0.0.1
```

Nginx server block 示例：

```nginx
server {
  listen 80;
  server_name agathon-edu.com www.agathon-edu.com;

  location / {
    proxy_pass http://127.0.0.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

然后用云厂商证书或 Certbot 配 HTTPS。

## Ollama 可选

```bash
docker compose --profile ollama up -d
docker compose exec ollama ollama pull qwen2.5:7b
```

`.env`：

```env
AI_PROVIDER=ollama
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b
```
