import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,

      secure: true,
    });
  }

  /**
   * Upload buffer (from multer memory) to Cloudinary.
   * options: folder, public_id, resource_type, transformation, etc.
   */
  async uploadBuffer(buffer: Buffer, options: any) {
    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          this.logger.error('Cloudinary upload error', error);
          return reject(error);
        }
        resolve(result);
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string) {
    return new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  // helper for generating signed upload url if needed (not covered here)
}
