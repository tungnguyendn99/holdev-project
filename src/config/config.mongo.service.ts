import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigMongoService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  // Lấy cấu hình Mongo cơ bản
  private getMongoConfig() {
    return {
      username: this.configService.get<string>('MONGO_USERNAME'),
      password: this.configService.get<string>('MONGO_PASSWORD'),
      host: this.configService.get<string>('MONGO_HOST'),
      port: this.configService.get<string>('MONGO_PORT'),
      database: this.configService.get<string>('MONGO_DATABASE'),
      uri: this.configService.get<string>('MONGO_URI'),
    };
  }

  // Tự build URI (nếu không có MONGO_URI)
  private buildUri(): string {
    const { username, password, host, port, database } = this.getMongoConfig();
    if (!host || !database) {
      throw new Error('Missing MongoDB host or database in environment variables');
    }

    // Trường hợp bạn dùng server tự setup (local hoặc remote VM)
    return `mongodb://${username && password ? `${username}:${encodeURIComponent(password)}@` : ''}${host}:${port}/${database}?authSource=admin`;
  }

  // Dùng cho MongooseModule.forRootAsync
  createMongooseOptions(): MongooseModuleOptions {
    const { uri } = this.getMongoConfig();
    const finalUri = uri || this.buildUri();

    console.log('[MongoDB URI]:', finalUri); // log ra để bạn dễ kiểm tra khi khởi động

    return {
      uri: finalUri,
      retryAttempts: 3,
      retryDelay: 3000,
    };
  }

  getRapidApiKey(): string {
    return this.configService.get<string>('RAPID_API_KEY');
  }

  getEnglishWordsUrlApi(): string {
    return this.configService.get<string>('ENGLISH_WORDS_API_URL');
  }
  
  getTranslateWordsUrlApi(): string {
    return this.configService.get<string>('TRANSLATE_API_URL');
  }

  getQuotesUrlApi(): string {
    return this.configService.get<string>('QUOTES_API_URL');
  }
}
