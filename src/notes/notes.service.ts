import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type Database, DRIZZLE } from '../database/database.constants';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note, notes } from '../database/schema';
import { and, desc, eq } from 'drizzle-orm';

@Injectable()
export class NotesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(userId: string, dto: CreateNoteDto) {
    const [note] = await this.db
      .insert(notes)
      .values({ ...dto, userId })
      .returning();

    return note;
  }

  findAllByUser(userId: string): Promise<Note[]> {
    return this.db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async findOneByUser(userId: string, id: string): Promise<Note> {
    const [note] = await this.db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }
}
