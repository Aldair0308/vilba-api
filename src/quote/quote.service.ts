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
  ) {
    console.log('🔧 QuoteService initialized with FirebaseService and DevicesService');
  }

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
      console.log(`🔄 Status changed from '${currentQuote.status}' to '${status}' - triggering approval notification`);
      await this.sendApprovalNotification(quote, userId);
    } else {
      console.log(`ℹ️ Status change from '${currentQuote.status}' to '${status}' - no notification needed`);
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
      console.log(`🔔 Starting approval notification process for quote ID: ${quote._id}`);
      
      // Obtener información del usuario que aprobó
      let userName = 'Usuario';
      if (userId) {
        console.log(`📋 Looking up user info for userId: ${userId}`);
        const user = await this.usersService.findOne(userId);
        if (user) {
          userName = user.name;
          console.log(`✅ Found user: ${userName}`);
        } else {
          console.log(`⚠️ User not found for userId: ${userId}`);
        }
      } else {
        console.log(`⚠️ No userId provided for approval notification`);
      }

      // Obtener información del cliente
      const client = quote.clientId as any;
      const clientName = client?.name || 'Cliente desconocido';
      console.log(`🏢 Client name: ${clientName}`);

      // Contar el número de equipos
      const numEquipment = quote.cranes.length;
      console.log(`🏗️ Number of equipment: ${numEquipment}`);

      // Obtener todos los administradores
      console.log(`👥 Fetching administrators...`);
      const admins = await this.usersService.findAdmins();
      console.log(`👥 Found ${admins.length} administrators`);

      if (admins.length === 0) {
        console.log(`⚠️ No administrators found in the system`);
        return;
      }

      // Crear el mensaje de notificación
      const message = `${userName} ha aprobado una cotización con ${numEquipment} equipo${numEquipment !== 1 ? 's' : ''} para el cliente ${clientName}`;
      console.log(`📝 Notification message: ${message}`);

      // Recopilar todos los tokens de dispositivos de administradores
      const adminTokens: string[] = [];
      
      for (const admin of admins) {
        try {
          console.log(`🔍 Getting tokens for admin: ${admin.email} (ID: ${admin._id})`);
          const userTokens = await this.devicesService.getActiveTokensByUserId(admin._id.toString());
          console.log(`📱 Found ${userTokens.length} active tokens for admin ${admin.email}`);
          adminTokens.push(...userTokens);
        } catch (error) {
          console.error(`❌ Error getting tokens for admin ${admin.email}:`, error);
        }
      }

      console.log(`📱 Total admin tokens collected: ${adminTokens.length}`);
      
      // Enviar notificación a todos los dispositivos de administradores si hay tokens
      if (adminTokens.length > 0) {
        try {
          console.log(`🚀 Sending notification to ${adminTokens.length} devices...`);
          const result = await this.firebaseService.sendPushToMultiple(
            adminTokens,
            'Cotización Aprobada',
            message,
          );
          console.log(`✅ Notification sent successfully!`);
          console.log(`📊 Success: ${result.successCount}, Failures: ${result.failureCount}`);
          
          if (result.failureCount > 0) {
            console.log(`⚠️ Some notifications failed:`, result.responses.filter(r => !r.success));
          }
        } catch (error) {
          console.error('❌ Error sending multiple notifications:', error);
        }
      } else {
        console.log('⚠️ No device tokens found for administrators');
      }
    } catch (error) {
      console.error('❌ Error in approval notification process:', error);
    }
  }
}
