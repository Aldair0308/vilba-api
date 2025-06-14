import { PartialType } from '@nestjs/mapped-types';
import { CreateCraneDto } from './create-crane.dto';

export class UpdateCraneDto extends PartialType(CreateCraneDto) {}
