# Dùng NodeJS nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file khai báo dependencies trước
COPY package*.json yarn.lock ./

# Cài dependency
RUN yarn install --frozen-lockfile

# Copy toàn bộ source code vào container
COPY . .

# Build NestJS (chuyển TypeScript -> JavaScript)
RUN yarn build:prod

# Mở cổng 3000 (hoặc port bạn config)
EXPOSE 3009

# Lệnh chạy app
CMD ["node", "dist/main.js"]
