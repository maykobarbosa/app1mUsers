import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SECONDS = 1;
const PROFILE_CACHE_KEY_PREFIX = 'profile:';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.prisma.$primary.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { id: string; email: string; name?: string | null }) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async getProfile(userId: string) {
    const cacheKey = `${PROFILE_CACHE_KEY_PREFIX}${userId}`;
    const cached = await this.cache.get<{ id: string; email: string; name: string | null }>(cacheKey);
    if (cached) {
      return cached;
    }
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const { password: _, ...profile } = user;
    const ttlSeconds = this.configService.get<number>('CACHE_TTL_SECONDS', 3600);
    await this.cache.set(cacheKey, profile, ttlSeconds * 1000 * SECONDS);
    return profile;
  }
}
