# Agathon Edu Migration

Base44 迁移重建版 MVP。当前版本先完成自有前端应用骨架，用于承载课程讲义、学生学习中心、知识图谱、教师后台入口和 AI 工作台。

## 当前已实现

- 16 周课程首页与已迁移课程入口
- 学生学习中心：学习统计、知识点图谱、个性化学习路径
- 教师后台雏形：作业提交、学情分析、课程内容、AI 批改模块占位
- AI 工作台：译文点评、生成练习、评分量表、练习提交
- Week12、Week13、Week15 课程页面
- Week2、Week5、Week6、Week11 课程页面
- 游戏本地化示例页面
- 裸翻实验、游戏分级合规、学生项目评析、练习库、教师后台迁移蓝图
- FastAPI 后端：AI 点评、练习生成、学生提交、教师汇总接口
- DeepSeek / Ollama / Mock 三种 AI Provider 接口
- Docker Compose、Nginx、PostgreSQL、Ollama 部署骨架
- 桌面与移动端响应式布局

## 本地运行

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

访问：

```text
http://127.0.0.1:5173/
```

## 构建

```bash
npm run build
```

构建产物在 `dist/`，可由 Nginx 或任意静态 Web 服务托管。

## 后端运行

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
AI_PROVIDER=mock uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

前端开发时如需连接后端：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 5173
```

## Docker 部署

复制环境变量模板：

```bash
cp .env.example .env
```

启动：

```bash
docker compose up -d --build
```

访问：

```text
http://服务器IP:8080/
```

使用 DeepSeek：

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 API Key
DEEPSEEK_MODEL=deepseek-chat
```

使用 Ollama：

```bash
docker compose --profile ollama up -d --build
docker compose exec ollama ollama pull qwen2.5:7b
```

`.env` 中设置：

```env
AI_PROVIDER=ollama
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b
```

## 数据位置

课程、知识点、课件页和游戏本地化案例先集中在：

```text
src/courseData.ts
```

后续可以迁移到 PostgreSQL，并通过后台 CMS 编辑。

## API 概览

```text
GET  /api/health
GET  /api/knowledge-points
GET  /api/exercises
POST /api/exercises/generate
POST /api/submissions
GET  /api/teacher/summary
POST /api/ai/review
```

`DATABASE_URL` 存在时后端使用 PostgreSQL；未配置或连接失败时会使用内存演示数据，方便本地前端继续开发。

## 后续迁移路线

1. 补全全部课件内容和练习数据。
2. 完成登录权限：student、teacher、guest、admin。
3. 教师后台继续增强：教师复评、班级筛选、学情报告导出。
4. 继续完善 DeepSeek/Ollama prompt、评分量表和练习生成逻辑。
5. 部署到国内云服务器并绑定域名、HTTPS。
