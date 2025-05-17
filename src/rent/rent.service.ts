import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Rent, RentSchema } from './schemas/rent.schema';

@Injectable()
export class RentService {
  constructor(@InjectModel(Rent.name) private rentModel: Model<Rent>) {}
  async create(createRentDto: CreateRentDto) {
    const rent = new this.rentModel(createRentDto);
    return await rent.save();
  }

  findAll() {
    return `This action returns all rent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rent`;
  }

  update(id: number, updateRentDto: UpdateRentDto) {
    return `This action updates a #${id} rent`;
  }

  remove(id: number) {
    return `This action removes a #${id} rent`;
  }
}
