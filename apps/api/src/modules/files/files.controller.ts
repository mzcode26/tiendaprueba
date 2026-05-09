import { Controller, Post, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('files')
export class FilesController {
  constructor(private service: FilesService) {}

 @Post('upload')
@UseInterceptors(FileInterceptor('file'))
@RequirePermissions('create_files')
async uploadFile(
  @CurrentUser() user: JwtPayload,
  @UploadedFile() file: Express.Multer.File,
) {
  const result = await this.service.uploadFile(file, `tienda/${user.tenantId}`);
  return { success: true, data: result };
}

  @Delete(':publicId')
  @RequirePermissions('delete_files')
  async deleteFile(
    @CurrentUser() _user: JwtPayload,
    @Param('publicId') publicId: string,
  ) {
    await this.service.deleteFile(publicId);
    return { success: true, message: 'File deleted successfully' };
  }
}