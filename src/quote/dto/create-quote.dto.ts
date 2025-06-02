import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsMongoId,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuoteCraneDto {
  @IsMongoId()
  crane: string;

  @IsNumber()
  dias: number;

  @IsNumber()
  precio: number;
}

export class CreateQuoteDto {
  @IsString()
  name: string;

  @IsString()
  zone: string;

  @IsMongoId()
  clientId: string;

  @IsMongoId()
  fileId: string;

  @IsEnum(['pending', 'rejected', 'aproved', 'active', 'completed'])
  @IsOptional()
  status?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuoteCraneDto)
  cranes: QuoteCraneDto[];

  @IsOptional()
  @IsNumber()
  iva?: number;

  @IsOptional()
  @IsString()
  total?: string;

  @IsString()
  responsibleId: string;
}
