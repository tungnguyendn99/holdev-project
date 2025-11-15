import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Req,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { diskStorage, memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  // Single file upload (multipart/form-data)
  @Post('upload')
  @UseGuards(AuthGuard('user-jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // store file in memory buffer
      limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Only images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() body: any) {
    if (!file) throw new BadRequestException('File is required');
    // optional folder or transformations
    const folder = process.env.CLOUDINARY_FOLDER || 'app_uploads';
    console.log('folder', folder);

    const options = {
      folder,
      overwrite: false,
      resource_type: 'image',
      // public_id: 'optional_name', // or let cloudinary manage
      transformation: body.transformation || undefined,
    };
    const userId = req.user.userId;
    const result = await this.imagesService.uploadAndSave(userId, file.buffer, options);
    return { isOk: true, result };
  }

  // multiple files
  @Post('upload-multiple')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: memoryStorage(), // for multiple, use FilesInterceptor instead in real code
    }),
  )
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const uploaded = await this.imagesService.uploadMultiple(files);
    return { items: uploaded };
  }

  @Get()
  @UseGuards(AuthGuard('user-jwt'))
  async list(@Req() req) {
    const userId = req.user.userId;
    return this.imagesService.findByOwner(userId);
  }

  @Delete()
  async remove(@Query('publicId') publicId: string) {
    return this.imagesService.removeByPublicId(publicId);
  }
}
