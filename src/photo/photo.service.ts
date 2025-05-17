import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Photo } from './schemas/photo.schema';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class PhotoService {
  constructor(@InjectModel(Photo.name) private photoModel: Model<Photo>) {}

  async create(photoData: {
    name: string;
    base64: string;
    department: string;
    responsible_id: string;
  }) {
    if (Buffer.byteLength(photoData.base64, 'base64') > MAX_FILE_SIZE) {
      throw new Error('El tamaño de la imagen excede el límite de 20MB');
    }

    const createdPhoto = new this.photoModel(photoData);
    return createdPhoto.save();
  }

  async findByDepartment(department: string) {
    return this.photoModel.find({ department }).exec();
  }

  async findByResponsible(responsible_id: string) {
    return this.photoModel.find({ responsible_id }).exec();
  }

  async remove(id: string) {
    return this.photoModel.findByIdAndDelete(id).exec();
  }
}
