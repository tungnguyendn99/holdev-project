import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://holdev-ui.onrender.com',
      'http://localhost:3000',
      'http://192.168.1.4:3000', // IP LAN của bạn (để mobile truy cập)
      'http://192.168.0.130:3000', // IP LAN của bạn (để mobile truy cập)
      'capacitor://localhost', // nếu build thành mobile app (Capacitor)
      'http://localhost', // nếu chạy app mobile với local dev server
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3009);
}
bootstrap();
