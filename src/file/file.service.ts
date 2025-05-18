import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './schemas/file.schema';
import { Patch } from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

type FileType = 'pdf' | 'excel';

@Injectable()
export class FileService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async create(fileData: {
    name: string;
    base64: string;
    type: FileType;
    department: string;
    responsible_id: string;
  }) {
    // Validación adicional en caso de que el controlador no la haya hecho
    if (!['pdf', 'excel'].includes(fileData.type)) {
      throw new Error('Tipo de archivo no soportado');
    }

    const fileSize = Buffer.byteLength(fileData.base64, 'base64');
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error('El tamaño del archivo excede el límite de 20MB');
    }

    const createdFile = new this.fileModel(fileData);
    return createdFile.save();
  }

  async findByDepartment(department: string) {
    return this.fileModel.find({ department }).exec();
  }

  async findByType(type: FileType) {
    return this.fileModel.find({ type }).exec();
  }

  async findByResponsible(responsible_id: string) {
    return this.fileModel.find({ responsible_id }).exec();
  }

  async findAll() {
    return this.fileModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    return this.fileModel
      .findByIdAndUpdate(id, updateFileDto, { new: true })
      .exec();
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
