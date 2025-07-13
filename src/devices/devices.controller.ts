import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpException, 
  HttpStatus,
  Query
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, RegisterDeviceDto } from './dto/device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  async register(@Body() registerDeviceDto: RegisterDeviceDto) {
    try {
      // Validate token format
      const isValidToken = await this.devicesService.validateToken(registerDeviceDto.token);
      if (!isValidToken) {
        throw new HttpException('Invalid token format', HttpStatus.BAD_REQUEST);
      }

      // Generate deviceId from platform and device info
      const deviceId = this.generateDeviceId(
        registerDeviceDto.userId,
        registerDeviceDto.platform,
        registerDeviceDto.deviceInfo
      );

      // Set device name from device info if not provided
      const deviceName = registerDeviceDto.deviceName || 
        (registerDeviceDto.deviceInfo ? 
          `${registerDeviceDto.deviceInfo.brand || ''} ${registerDeviceDto.deviceInfo.modelName || ''}`.trim() :
          `${registerDeviceDto.platform} Device`);

      const device = await this.devicesService.create({
        token: registerDeviceDto.token,
        deviceId,
        userId: registerDeviceDto.userId,
        platform: registerDeviceDto.platform,
        deviceName,
        appVersion: registerDeviceDto.appVersion,
        isActive: true,
        metadata: {
          ...registerDeviceDto.metadata,
          deviceInfo: registerDeviceDto.deviceInfo,
          registeredAt: new Date().toISOString()
        }
      });

      return {
        success: true,
        message: 'Device registered successfully',
        device: {
          id: device._id,
          deviceId: device.deviceId,
          platform: device.platform,
          deviceName: device.deviceName,
          isActive: device.isActive
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to register device',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private generateDeviceId(userId: string, platform: string, deviceInfo?: any): string {
    // Create a unique device identifier
    const timestamp = Date.now();
    const deviceIdentifier = deviceInfo ? 
      `${deviceInfo.brand || 'unknown'}-${deviceInfo.modelName || 'unknown'}` :
      'unknown-device';
    
    return `${platform}-${userId.slice(-8)}-${deviceIdentifier}-${timestamp}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    try {
      const device = await this.devicesService.create(createDeviceDto);
      return {
        success: true,
        message: 'Device created successfully',
        device
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create device',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const devices = await this.devicesService.findAll();
      return {
        success: true,
        devices
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch devices',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      const devices = await this.devicesService.findByUserId(userId);
      return {
        success: true,
        devices
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch user devices',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tokens/active')
  async getActiveTokens(@Query('userId') userId?: string) {
    try {
      let tokens: string[];
      
      if (userId) {
        tokens = await this.devicesService.getActiveTokensByUserId(userId);
      } else {
        tokens = await this.devicesService.getActiveTokens();
      }

      return {
        success: true,
        tokens,
        count: tokens.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch active tokens',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    try {
      const device = await this.devicesService.update(id, updateDeviceDto);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        message: 'Device updated successfully',
        device
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update device',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const device = await this.devicesService.remove(id);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        message: 'Device deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete device',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete('token/:token')
  async removeByToken(@Param('token') token: string) {
    try {
      const device = await this.devicesService.removeByToken(token);
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        message: 'Device deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete device',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}