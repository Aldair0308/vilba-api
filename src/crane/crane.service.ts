import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCraneDto } from './dto/create-crane.dto';
import { UpdateCraneDto } from './dto/update-crane.dto';
import { Crane, CraneDocument } from './entities/crane.entity';

@Injectable()
export class CraneService {
  constructor(
    @InjectModel(Crane.name) private craneModel: Model<CraneDocument>,
  ) {}

  async create(createCraneDto: CreateCraneDto): Promise<Crane> {
    const createdCrane = new this.craneModel(createCraneDto);
    return createdCrane.save();
  }

  async findAll(): Promise<Crane[]> {
    return this.craneModel.find().exec();
  }

  async findOne(id: string): Promise<Crane> {
    return this.craneModel.findById(id).exec();
  }

  async update(id: string, updateCraneDto: UpdateCraneDto): Promise<Crane> {
    return this.craneModel
      .findByIdAndUpdate(id, updateCraneDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Crane> {
    return this.craneModel.findByIdAndDelete(id).exec();
  }
}
