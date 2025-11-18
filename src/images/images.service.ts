import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMAGE_COLLECTION_NAME } from './schemas/constants';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(IMAGE_COLLECTION_NAME) private imageModel: Model<any>,
    private cloudinary: CloudinaryService,
  ) {}

  async saveImageRecord(data: any) {
    const doc = new this.imageModel(data);
    return doc.save();
  }

  async uploadAndSave(userId: string, buffer: Buffer, options: any = {}, type: string) {
    const res = await this.cloudinary.uploadBuffer(buffer, options);
    // res contains public_id, secure_url, width, height, format, bytes, folder...
    const saved = await this.saveImageRecord({
      publicId: res.public_id,
      url: res.secure_url,
      width: res.width,
      height: res.height,
      format: res.format,
      size: res.bytes,
      folder: res.folder,
      userId: userId,
      user: userId,
      type,
    });
    return { cloudinary: res, db: saved };
  }

  async removeByPublicId(publicId: string) {
    try {
      console.log('publicId', publicId);

      await this.cloudinary.delete(publicId);
      return this.imageModel.findOneAndDelete({ publicId }).exec();
    } catch (error) {
      console.log('error');
    }
  }

  // extra helpers: find, paginate...
  async findByOwner(userId: string, type: string) {
    const query = {
      userId,
      ...(type !== undefined && { type }),
    }
    return this.imageModel.find(query).sort({ createdAt: -1 }).exec();
  }

  // images.service.ts
  async uploadMultiple(userId: string, files: Express.Multer.File[], type: string) {
    try {
      const results = [];
      let folder = process.env.CLOUDINARY_FOLDER || 'user_uploads';
      if (userId === '690a0c764e4ed3dcf5eb437a') {
        folder = process.env.CLOUDINARY_FOLDER_TEST;
      }

      for (const file of files) {
        const res = await this.cloudinary.uploadBuffer(file.buffer, {
          folder,
          resource_type: 'image',
        });
        const saved = await this.saveImageRecord({
          publicId: res.public_id,
          url: res.secure_url,
          width: res.width,
          height: res.height,
          format: res.format,
          size: res.bytes,
          folder: res.folder,
          userId: userId,
          user: userId,
          type,
        });
        results.push(saved.url);
      }

      return results;
    } catch (error) {
      console.log('error', error);
    }
  }
}
