import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './schemas/quote.schema';
import { UsersService } from '../users/users.service';
import { ClientService } from '../client/client.service';
import { FirebaseService } from '../firebase/firebase.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    private usersService: UsersService,
    private clientService: ClientService,
    private firebaseService: FirebaseService,
    private devicesService: DevicesService,
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

      // Recopilar todos los tokens de dispositivos de administradores
      const adminTokens: string[] = [];
      
      for (const admin of admins) {
        try {
          const userTokens = await this.devicesService.getActiveTokensByUserId(admin._id.toString());
          adminTokens.push(...userTokens);
        } catch (error) {
          console.error(`Error obteniendo tokens para admin ${admin.email}:`, error);
        }
      }

      // Enviar notificación a todos los dispositivos de administradores si hay tokens
      if (adminTokens.length > 0) {
        try {
          await this.firebaseService.sendPushToMultiple(
            adminTokens,
            'Cotización Aprobada',
            message,
          );
          console.log(`Notificación enviada a ${adminTokens.length} dispositivos de administradores`);
        } catch (error) {
          console.error('Error enviando notificaciones múltiples:', error);
        }
      } else {
        console.log('No se encontraron tokens de dispositivos para administradores');
      }
    } catch (error) {
      console.error('Error enviando notificaciones de aprobación:', error);
    }
  }
}
