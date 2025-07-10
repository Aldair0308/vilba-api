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
    // Check if device already exists
    const existingDevice = await this.deviceModel.findOne({
      $or: [
        { token: createDeviceDto.token },
        { deviceId: createDeviceDto.deviceId }
      ]
    });

    if (existingDevice) {
      // Update existing device with new token
      return this.deviceModel.findByIdAndUpdate(
        existingDevice._id,
        createDeviceDto,
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
    // Basic token validation
    if (!token || token.length < 10) {
      return false;
    }
    
    // Check if token format is valid (FCM tokens are typically 163 characters)
    const fcmTokenRegex = /^[a-zA-Z0-9_-]+$/;
    return fcmTokenRegex.test(token);
  }
}