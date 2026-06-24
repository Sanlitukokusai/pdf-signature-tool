# 纯客户端 PDF 工具：Next 静态导出(out/) + nginx 静态托管。
# 运行内存从 ~57MB(next start 全量 node) 降到 ~5MB(nginx)，功能不变。
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
