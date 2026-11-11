import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { User } from '../database/schema';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

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

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    const passwordOk =
      !!user && (await argon2.verify(user.passwordHash, dto.password));

    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    await this.usersService.setRefreshTokenHash(
      user.id,
      await argon2.hash(tokens.refreshToken),
    );

    return tokens;
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: Number(this.config.getOrThrow('JWT_ACCESS_TTL')),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: Number(this.config.getOrThrow('JWT_REFRESH_TTL')),
        jwtid: randomUUID(),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
