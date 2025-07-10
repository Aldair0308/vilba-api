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
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsEnum(['ios', 'android', 'web'])
  platform: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}