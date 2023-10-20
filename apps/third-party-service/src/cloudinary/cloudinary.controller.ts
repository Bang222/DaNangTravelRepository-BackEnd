import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';

@Controller()
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    return result.secure_url;
  }
  @MessagePattern({ uploads: 'uploads' })
  // @UseInterceptors(FilesInterceptor('files[]', 10))
  async uploadImages(@Ctx() context: RmqContext, @Payload() files: any) {
    this.sharedService.acknowledgeMessage(context);
    // const files = JSON.parse(filesJSON);
    if (!files) {
      return files;
    }
    const uploadResults = await this.cloudinaryService.uploadFiles(files.files);
    const secureUrls = uploadResults.map((result) => result.secure_url);
    return secureUrls;
  }
}
