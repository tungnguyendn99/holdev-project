import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigMongoService } from './config.mongo.service';
import { UtilService } from './util.service';
import { ConfigManagerModule } from '@nestjsplus/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    ConfigManagerModule.register({
      useEnv: {
        folder: 'config',
      },
      allowExtras: true,
    }),
    HttpModule,
  ],
  providers: [ConfigMongoService, UtilService],
  exports: [ConfigMongoService, UtilService],
})
export class MongoConfigModule {}
