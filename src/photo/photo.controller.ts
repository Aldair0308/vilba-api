import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post()
  async create(
    @Body()
    photoData: {
      name: string;
      base64: string;
      department: string;
      responsible_id: string;
    },
  ) {
    return this.photoService.create(photoData);
  }

  @Get('department')
  async findByDepartment(@Query('department') department: string) {
    return this.photoService.findByDepartment(department);
  }

  @Get('department/gruas')
  async findGruasPhotos() {
    return this.photoService.findByDepartment('gruas');
  }

  @Get('responsible')
  async findByResponsible(@Query('responsible_id') responsible_id: string) {
    return this.photoService.findByResponsible(responsible_id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.photoService.remove(id);
  }
}
