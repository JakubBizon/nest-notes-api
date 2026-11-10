import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with that email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({ email, passwordHash });

    const { passwordHash: _ph, refreshTokenHash: _rt, ...safeUser } = user;
    return safeUser;
  }
}
