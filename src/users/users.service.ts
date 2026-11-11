import { Inject, Injectable } from '@nestjs/common';
import { type Database, DRIZZLE } from '../database/database.constants';
import { NewUser, User, users } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: Pick<NewUser, 'email' | 'passwordHash'>): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
