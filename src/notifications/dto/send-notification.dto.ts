import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class SendMultipleNotificationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tokens: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}