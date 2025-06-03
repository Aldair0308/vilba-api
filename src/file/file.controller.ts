import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { UpdateFileDto } from './dto/update-file.dto';

type FileType = 'pdf' | 'excel';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async create(
    @Body()
    fileData: {
      name: string;
      base64: string;
      type: FileType;
      department: string;
      responsible_id: string;
    },
  ) {
    // Validar tipo de archivo
    if (!['pdf', 'excel'].includes(fileData.type)) {
      throw new Error('Tipo de archivo no soportado');
    }

    // Validar tamaño máximo de 20MB
    const fileSize = Buffer.byteLength(fileData.base64, 'base64');
    if (fileSize > 20 * 1024 * 1024) {
      throw new Error('El tamaño del archivo excede el límite de 20MB');
    }

    return this.fileService.create(fileData);
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get('department/gruas')
  findGruasFiles() {
    return this.fileService.findByDepartment('gruas');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const file = await this.fileService.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
