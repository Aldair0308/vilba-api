import { IsDate, IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { RentStatus } from '../schemas/rent.schema';

export class CreateRentDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsMongoId()
  @IsNotEmpty()
  quote: string;

  @IsMongoId()
  @IsNotEmpty()
  crane: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  status?: RentStatus;
}
