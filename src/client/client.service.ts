import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './schemas/client.schema';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createdClient = new this.clientModel(createClientDto);
    return createdClient.save();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().exec();
  }

  async findOne(id: string): Promise<Client> {
    return this.clientModel.findById(id).exec();
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    return this.clientModel
      .findByIdAndUpdate(id, updateClientDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Client> {
    return this.clientModel.findByIdAndDelete(id).exec();
  }
}
