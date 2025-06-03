import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';

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
  precios: Array<{ zona: string; precio: number }>;
}
