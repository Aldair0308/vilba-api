import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Log, LogDocument } from './schemas/log.schema';

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const log = new this.logModel(createLogDto);
    return await log.save();
  }

  async findAll(): Promise<Log[]> {
    return await this.logModel
      .find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Log> {
    return await this.logModel
      .findById(id)
      .populate('userId', 'name email')
      .exec();
  }

  async findByUser(userId: string): Promise<Log[]> {
    return await this.logModel
      .find({ userId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByModule(module: string): Promise<Log[]> {
    return await this.logModel
      .find({ module })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEntity(entityId: string): Promise<Log[]> {
    return await this.logModel
      .find({ entityId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateLogDto: UpdateLogDto): Promise<Log> {
    return await this.logModel
      .findByIdAndUpdate(id, updateLogDto, { new: true })
      .populate('userId', 'name email')
      .exec();
  }

  async remove(id: string): Promise<Log> {
    return await this.logModel.findByIdAndDelete(id).exec();
  }

  // Helper method to create logs programmatically
  async createLog(
    userId: string,
    userName: string,
    action: string,
    module: string,
    entityId: string,
    options?: {
      entityName?: string;
      previousData?: any;
      newData?: any;
      description?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<Log> {
    const logData: CreateLogDto = {
      userId,
      userName,
      action: action as any,
      module: module as any,
      entityId,
      ipAddress: options?.ipAddress || 'unknown',
      ...options
    };
    
    return await this.create(logData);
  }
}
