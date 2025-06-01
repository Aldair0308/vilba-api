import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class PrecioDto {
  @IsString()
  @IsNotEmpty()
  zona: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  precio: number[];
}

export class CreateCraneDto {
  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  capacidad: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  tipoCotizacion: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrecioDto)
  precios: PrecioDto[];

  @IsOptional()
  @IsString()
  category?: string;
}
