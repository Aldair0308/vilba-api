import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CraneService } from './crane.service';
import { CreateCraneDto } from './dto/create-crane.dto';
import { UpdateCraneDto } from './dto/update-crane.dto';

@Controller('crane')
export class CraneController {
  constructor(private readonly craneService: CraneService) {}

  @Post()
  create(@Body() createCraneDto: CreateCraneDto) {
    return this.craneService.create(createCraneDto);
  }

  @Get()
  findAll() {
    return this.craneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.craneService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCraneDto: UpdateCraneDto) {
    return this.craneService.update(id, updateCraneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.craneService.remove(id);
  }
}
