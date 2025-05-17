import { IsString, IsNumber, IsOptional, IsEnum, IsMongoId } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  name: string;

  @IsString()
  zone: string;

  @IsNumber()
  hourlyRate: number;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  projectRate?: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @IsMongoId()
  crane: string;
}