import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quoteService.create(createQuoteDto);
  }

  @Get()
  findAll() {
    return this.quoteService.findAll();
  }

  @Get('pending')
  async findPending() {
    return this.quoteService.findByStatus('pending');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quoteService.findOne(id);
  }

  @Put('switch/:id/:status')
  async switchStatus(
    @Param('id') id: string, 
    @Param('status') status: string,
    @Query('userId') userId?: string
  ) {
    // Validar que el status sea uno de los permitidos
    const validStatuses = [
      'pending',
      'rejected',
      'aproved',
      'active',
      'completed',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    return this.quoteService.switchStatus(id, status, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quoteService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quoteService.remove(id);
  }

  @Post(':id/test-notification')
  async testApprovalNotification(@Param('id') id: string, @Query('userId') userId?: string) {
    console.log(`🧪 Testing approval notification for quote ${id}`);
    const quote = await this.quoteService.findOne(id);
    
    // Llamar directamente al método de notificación para pruebas
    await (this.quoteService as any).sendApprovalNotification(quote, userId);
    
    return {
      success: true,
      message: `Test notification sent for quote ${id}`,
      quoteId: id,
      userId: userId || 'not provided'
    };
  }

  @Post(':id/test-status-notification')
  async testStatusChangeNotification(
    @Param('id') id: string, 
    @Query('previousStatus') previousStatus: string = 'pending',
    @Query('newStatus') newStatus: string = 'aproved',
    @Query('userId') userId?: string
  ) {
    console.log(`🧪 Testing status change notification for quote ${id}`);
    const quote = await this.quoteService.findOne(id);
    
    // Llamar directamente al método de notificación para pruebas
    await (this.quoteService as any).sendStatusChangeNotificationToAdmins(quote, previousStatus, newStatus, userId);
    
    return {
      success: true,
      message: `Test status change notification sent for quote ${id}`,
      quoteId: id,
      previousStatus,
      newStatus,
      userId: userId || 'not provided'
    };
  }
}
