import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './schemas/quote.schema';
import { UsersService } from '../users/users.service';
import { ClientService } from '../client/client.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    private usersService: UsersService,
    private clientService: ClientService,
    private firebaseService: FirebaseService,
  ) {}

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

  async switchStatus(id: string, status: string, userId?: string): Promise<Quote> {
    // Obtener la cotización actual para verificar el estado anterior
    const currentQuote = await this.quoteModel.findById(id).populate('clientId').exec();
    
    if (!currentQuote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

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
      .populate('clientId')
      .exec();

    // Enviar notificación si el estado cambió de 'pending' a 'aproved'
    if (currentQuote.status === 'pending' && status === 'aproved') {
      await this.sendApprovalNotification(quote, userId);
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

  async findQuotesWithDeliveryDates(): Promise<Quote[]> {
    return this.quoteModel
      .find({
        status: { $in: ['aproved', 'active'] },
        'cranes.fecha_entrega': { $exists: true, $ne: null }
      })
      .populate('cranes')
      .exec();
  }

  private async sendApprovalNotification(quote: Quote, userId?: string): Promise<void> {
    try {
      // Obtener información del usuario que aprobó
      let userName = 'Usuario';
      if (userId) {
        const user = await this.usersService.findOne(userId);
        if (user) {
          userName = user.name;
        }
      }

      // Obtener información del cliente
      const client = quote.clientId as any;
      const clientName = client?.name || 'Cliente desconocido';

      // Contar el número de equipos
      const numEquipment = quote.cranes.length;

      // Obtener todos los administradores
      const admins = await this.usersService.findAdmins();

      // Crear el mensaje de notificación
      const message = `${userName} ha aprobado una cotización con ${numEquipment} equipo${numEquipment !== 1 ? 's' : ''} para el cliente ${clientName}`;

      // Enviar notificación a cada administrador
      for (const admin of admins) {
        // Aquí asumo que los administradores tienen tokens de dispositivo
        // Si no los tienen, esta parte se puede omitir o manejar de otra manera
        try {
           await this.firebaseService.sendPush(
             admin.email, // Usar email como token temporal, esto debería ser el token real del dispositivo
             'Cotización Aprobada',
             message,
           );
         } catch (error) {
           console.error(`Error enviando notificación a admin ${admin.email}:`, error);
         }
      }
    } catch (error) {
      console.error('Error enviando notificaciones de aprobación:', error);
    }
  }
}
