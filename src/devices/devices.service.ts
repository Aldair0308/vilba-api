import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from './schemas/device.schema';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<Device>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // Check if device already exists by token or deviceId for the same user
    const existingDevice = await this.deviceModel.findOne({
      $and: [
        { userId: createDeviceDto.userId },
        {
          $or: [
            { token: createDeviceDto.token },
            { deviceId: createDeviceDto.deviceId }
          ]
        }
      ]
    });

    if (existingDevice) {
      // Update existing device with new data
      return this.deviceModel.findByIdAndUpdate(
        existingDevice._id,
        {
          ...createDeviceDto,
          lastSeen: new Date()
        },
        { new: true }
      );
    }

    // Check if token exists for a different user (tokens should be unique globally)
    const tokenExists = await this.deviceModel.findOne({ token: createDeviceDto.token });
    if (tokenExists) {
      // Update the existing token with new user and device info
      return this.deviceModel.findByIdAndUpdate(
        tokenExists._id,
        {
          ...createDeviceDto,
          lastSeen: new Date()
        },
        { new: true }
      );
    }

    const createdDevice = new this.deviceModel(createDeviceDto);
    return createdDevice.save();
  }

  async findAll(): Promise<Device[]> {
    return this.deviceModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Device[]> {
    return this.deviceModel.find({ userId }).exec();
  }

  async findByToken(token: string): Promise<Device> {
    return this.deviceModel.findOne({ token }).exec();
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    return this.deviceModel.findByIdAndUpdate(id, updateDeviceDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Device> {
    return this.deviceModel.findByIdAndDelete(id).exec();
  }

  async removeByToken(token: string): Promise<Device> {
    return this.deviceModel.findOneAndDelete({ token }).exec();
  }

  async getActiveTokens(): Promise<string[]> {
    const devices = await this.deviceModel.find({ isActive: true }).select('token').exec();
    return devices.map(device => device.token);
  }

  async getActiveTokensByUserId(userId: string): Promise<string[]> {
    const devices = await this.deviceModel.find({ 
      userId, 
      isActive: true 
    }).select('token').exec();
    return devices.map(device => device.token);
  }

  async validateToken(token: string): Promise<boolean> {
    // Accept any token format for testing purposes
    return true;
  }
}