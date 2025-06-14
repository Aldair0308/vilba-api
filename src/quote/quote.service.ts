import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './schemas/quote.schema';

@Injectable()
export class QuoteService {
  constructor(@InjectModel(Quote.name) private quoteModel: Model<Quote>) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const createdQuote = new this.quoteModel(createQuoteDto);
    return createdQuote.save();
  }

  async findAll(): Promise<Quote[]> {
    return this.quoteModel.find().populate('cranes').exec();
  }

  async findOne(id: string): Promise<Quote> {
    return this.quoteModel.findById(id).populate('cranes').exec();
  }

  async findByCrane(craneId: string): Promise<Quote[]> {
    return this.quoteModel.find({ cranes: craneId }).populate('cranes').exec();
  }

  async findByStatus(status: string): Promise<Quote[]> {
    return this.quoteModel.find({ status }).populate('cranes').exec();
  }

  async switchStatus(id: string, status: string): Promise<Quote> {
    const quote = await this.quoteModel
      .findByIdAndUpdate(
        id,
        {
          status,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .populate('cranes')
      .exec();

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    return this.quoteModel
      .findByIdAndUpdate(id, updateQuoteDto, { new: true })
      .populate('cranes')
      .exec();
  }

  async remove(id: string): Promise<Quote> {
    return this.quoteModel.findByIdAndDelete(id).exec();
  }
}
