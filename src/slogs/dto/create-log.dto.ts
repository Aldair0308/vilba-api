import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { LogAction, LogModule } from '../schemas/log.schema';

export class CreateLogDto {
  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsEnum(LogAction)
  action: LogAction;

  @IsEnum(LogModule)
  module: LogModule;

  @IsString()
  entityId: string;

  @IsOptional()
  @IsString()
  entityName?: string;

  @IsOptional()
  @IsObject()
  previousData?: any;

  @IsOptional()
  @IsObject()
  newData?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}