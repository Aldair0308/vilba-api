import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(['ios', 'android', 'web'])
  platform: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Admin registration fields
  @IsString()
  @IsOptional()
  adminId?: string;

  @IsString()
  @IsOptional()
  adminName?: string;

  @IsString()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  adminRole?: string;

  @IsBoolean()
  @IsOptional()
  registeredByAdmin?: boolean;
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class DeviceInfoDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  @IsOptional()
  osName?: string;

  @IsString()
  @IsOptional()
  osVersion?: string;
}

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['ios', 'android', 'web'])
  platform: string;

  @IsObject()
  @IsOptional()
  deviceInfo?: DeviceInfoDto;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Admin registration fields
  @IsString()
  @IsOptional()
  adminId?: string;

  @IsString()
  @IsOptional()
  adminName?: string;

  @IsString()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  adminRole?: string;

  @IsBoolean()
  @IsOptional()
  registeredByAdmin?: boolean;
}