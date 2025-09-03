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
import { EventsService } from '../events/events.service';

@Controller('quote')
export class QuoteController {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly eventsService: EventsService
  ) {}

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

  @Get('rented-equipment')
  async findRentedEquipment() {
    return this.quoteService.findRentedEquipment();
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

  @Get('debug/admin-devices')
  async debugAdminDevices() {
    console.log(`🔍 Debugging admin devices...`);
    
    // Obtener administradores
    const admins = await (this.quoteService as any).usersService.findAdmins();
    console.log(`👥 Found ${admins.length} administrators`);
    
    const adminDevices = [];
    
    for (const admin of admins) {
      const devices = await (this.quoteService as any).devicesService.findByUserId(admin._id.toString());
      adminDevices.push({
        adminId: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        adminRole: admin.rol,
        deviceCount: devices.length,
        devices: devices.map(d => ({ 
          token: d.token.substring(0, 20) + '...', 
          isActive: d.isActive,
          userId: d.userId,
          userRole: admin.rol,
          registeredByAdmin: d.registeredByAdmin || false,
          adminInfo: d.registeredByAdmin ? {
            adminId: d.adminId,
            adminName: d.adminName,
            adminEmail: d.adminEmail,
            adminRole: d.adminRole
          } : null
        }))
      });
    }
    
    return {
      success: true,
      totalAdmins: admins.length,
      adminDevices
    };
  }

  @Get('debug/all-devices')
  async debugAllDevices() {
    console.log(`🔍 Debugging all devices...`);
    
    // Obtener todos los dispositivos
    const allDevices = await (this.quoteService as any).devicesService.findAll();
    console.log(`📱 Found ${allDevices.length} total devices`);
    
    const deviceDetails = [];
    
    for (const device of allDevices) {
      // Obtener información del usuario para cada dispositivo
      const user = await (this.quoteService as any).usersService.findOne(device.userId);
      deviceDetails.push({
        deviceId: device._id,
        token: device.token.substring(0, 20) + '...',
        isActive: device.isActive,
        userId: device.userId,
        userName: user ? user.name : 'Usuario no encontrado',
        userEmail: user ? user.email : 'Email no encontrado',
        userRole: user ? user.rol : 'Rol no encontrado',
        lastSeen: device.lastSeen,
        createdAt: device.createdAt
      });
    }
    
    // Separar por roles
    const adminDevices = deviceDetails.filter(d => d.userRole === 'admin');
    const userDevices = deviceDetails.filter(d => d.userRole === 'user');
    const unknownDevices = deviceDetails.filter(d => d.userRole === 'Rol no encontrado');
    
    return {
      success: true,
      totalDevices: allDevices.length,
      adminDevices: {
        count: adminDevices.length,
        devices: adminDevices
      },
      userDevices: {
        count: userDevices.length,
        devices: userDevices
      },
      unknownDevices: {
        count: unknownDevices.length,
        devices: unknownDevices
      }
    };
  }

  @Post('test-rental-end')
  async testRentalEnd() {
    try {
      // Simular el proceso de finalización de renta manualmente
      const rentedEquipment = await this.quoteService.findRentedEquipment();
      
      if (rentedEquipment.length === 0) {
        return {
          success: true,
          message: 'No rented equipment found to test',
          equipmentProcessed: 0
        };
      }

      const now = new Date();
      let equipmentUpdated = 0;
      const results = [];

      // Revisar cada equipo rentado
      for (const equipment of rentedEquipment) {
        const rentalEndDate = new Date(equipment.rentalEndDate);
        
        // Para prueba, considerar equipos que terminan en las próximas 24 horas
        const timeDiff = rentalEndDate.getTime() - now.getTime();
        const hoursUntilEnd = timeDiff / (1000 * 60 * 60);
        
        results.push({
          craneId: equipment.craneId,
          rentalEndDate: equipment.rentalEndDate,
          hoursUntilEnd: Math.round(hoursUntilEnd * 100) / 100,
          shouldEnd: rentalEndDate <= now,
          processed: false
        });
        
        // Si la fecha de fin de renta ya pasó
        if (rentalEndDate <= now) {
          try {
            // Cambiar estado de la grúa de 'en_renta' a 'disponible'
            await this.quoteService.updateCraneStatus(equipment.craneId, 'disponible');
            equipmentUpdated++;
            results[results.length - 1].processed = true;
          } catch (error) {
            results[results.length - 1].error = error.message;
          }
        }
      }

      return {
        success: true,
        message: `Rental end test completed. Updated ${equipmentUpdated} equipment to 'disponible'`,
        equipmentProcessed: equipmentUpdated,
        totalEquipment: rentedEquipment.length,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('test-return-events')
  async testReturnEvents(@Query('createReal') createReal?: string) {
    const shouldCreateReal = createReal === 'true';
    try {
      // Usar EventsService inyectado para verificar eventos existentes
      
      // Simular el proceso de creación de eventos de devolución manualmente
      const approvedQuotes = await this.quoteService.findByStatus('aproved');
      const activeQuotes = await this.quoteService.findByStatus('active');
      const allQuotes = [...approvedQuotes, ...activeQuotes];

      if (allQuotes.length === 0) {
        return {
          success: true,
          message: 'No approved or active quotes found to test',
          eventsCreated: 0
        };
      }

      let eventsCreated = 0;
      const results = [];

      // Revisar cada cotización
      for (const quote of allQuotes) {
        if (!quote.cranes || quote.cranes.length === 0) {
          continue;
        }

        // Verificar cada grúa en la cotización
        for (const crane of quote.cranes) {
          // Solo procesar grúas que están entregadas y tienen fecha de entrega
          if (crane.entregado === true && crane.fecha_entrega && crane.crane) {
            try {
              // Calcular fecha de devolución basada en la lógica de renta
              const deliveryDate = new Date(crane.fecha_entrega);
              const rentalDays = crane.dias || 1;
              
              // Fecha de inicio de renta: 12:00 AM del día de entrega
              const rentalStartDate = new Date(deliveryDate);
              rentalStartDate.setUTCHours(6, 0, 0, 0); // 12:00 AM México = 06:00 UTC
              
              // Fecha de fin de renta: 12:00 AM del día después del período de renta
              const returnDate = new Date(rentalStartDate);
              returnDate.setDate(returnDate.getDate() + rentalDays);

              // Obtener información del equipo para verificación
              const equipmentInfo = crane.crane as any;
              let equipmentName = equipmentInfo?.nombre || 'Equipo';
              
              // Limpiar el nombre del equipo para comparación
              equipmentName = equipmentName.replace(/\s*\([^)]*\)\s*/g, '').trim();
              equipmentName = equipmentName.replace(/\s+$/, '');

              // Verificar si ya existe un evento para esta devolución específica
               let eventExists = false;
               try {
                 const existingEvents = await this.eventsService.findByDateRange(
                   new Date(returnDate.getTime() - 24 * 60 * 60 * 1000), // 1 día antes
                   new Date(returnDate.getTime() + 24 * 60 * 60 * 1000), // 1 día después
                 );

                eventExists = existingEvents.some(event => 
                  event.description.includes(equipmentName) &&
                  event.title.includes('Devolución de equipo') &&
                  event.title.includes(equipmentName)
                );
              } catch (error) {
                // Si hay error verificando eventos, asumir que no existe
                eventExists = false;
              }

              // Obtener información del cliente
              const client = quote.clientId as any;
              const clientName = client?.name || 'Cliente desconocido';
              const equipmentModel = equipmentInfo?.modelo || 'N/A';

              const wouldCreate = !eventExists;
              let actuallyCreated = false;
              
              if (wouldCreate && shouldCreateReal) {
                try {
                  // Crear evento real
                  const eventTitle = `Recordatorio: Devolución de equipo ${equipmentName}`;
                  const eventDescription = `El cliente ${clientName} debe devolver el equipo ${equipmentName}`;
                  
                  await this.eventsService.createEvent(
                    eventTitle,
                    eventDescription,
                    returnDate,
                    '000000000000000000000000', // userId temporal
                    'Sistema Automático', // userName
                    'service', // type
                    {
                      location: '',
                      notes: '',
                      reminderMinutes: 15,
                      allDay: false,
                      color: '#4CAF50'
                    }
                  );
                  actuallyCreated = true;
                } catch (error) {
                  console.error('Error creating real event:', error);
                }
              }
              
              results.push({
                quoteId: quote._id,
                quoteName: quote.name,
                clientName,
                equipmentName,
                equipmentModel,
                deliveryDate: crane.fecha_entrega,
                rentalDays,
                returnDate,
                eventWouldBeCreated: wouldCreate,
                eventExists: eventExists,
                actuallyCreated: actuallyCreated
              });

              if (wouldCreate) {
                eventsCreated++;
              }
            } catch (error) {
              results.push({
                quoteId: quote._id,
                error: error.message
              });
            }
          }
        }
      }

      return {
        success: true,
        message: `Return events test completed. Would create ${eventsCreated} events`,
        eventsCreated,
        totalQuotes: allQuotes.length,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
}
