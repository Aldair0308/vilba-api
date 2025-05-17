import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RentStatus } from '../schemas/rent.schema';

export class UpdateRentDto {
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  quote?: string;

  @IsString()
  @IsOptional()
  crane?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsOptional()
  status?: RentStatus;
}
