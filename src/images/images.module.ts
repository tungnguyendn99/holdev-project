import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImageSchema } from './schemas/image.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { IMAGE_COLLECTION_NAME } from './schemas/constants';

@Module({
  imports: [MongooseModule.forFeature([{ name: IMAGE_COLLECTION_NAME, schema: ImageSchema }]), CloudinaryModule],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
