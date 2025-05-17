import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcriptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ name, email, password, photo }: RegisterDto) {
    // Verificar si el correo electrónico ya está registrado
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Ya hay un usuario registrado usando ese correo',
      );
    }

    // Si el correo electrónico no está registrado, crear el nuevo usuario
    return await this.usersService.create({
      name,
      email,
      password,
      photo, // Guardar la foto si está presente
    });
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('El correo es incorrecto');
    }

    const isPasswordValid = await bcriptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }

    const payload = {
      email: user.email,
      rol: user.rol,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user,
      token,
    };
  }

  async loginWeb({ email, password }: LoginDto) {
    // Busca el usuario por email
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('El correo es incorrecto');
    }

    // Verifica la contraseña
    const isPasswordValid = await bcriptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }

    // Prepara el payload del token incluyendo la propiedad rol
    const payload = {
      email: user.email,
      rol: user.rol, // Incluye la propiedad rol en el payload
    };

    // Firma el token con el payload
    const token = await this.jwtService.signAsync(payload);

    // Devuelve el usuario y el token
    return {
      user,
      token,
    };
  }
}
