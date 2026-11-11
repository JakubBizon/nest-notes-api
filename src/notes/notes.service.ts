import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type Database, DRIZZLE } from '../database/database.constants';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note, notes } from '../database/schema';
import { and, desc, eq } from 'drizzle-orm';
import { UpdateNoteDto } from './dto/update-note.dto';

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

  async delete(userId: string, id: string) {
    const [note] = await this.db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    if (!note) {
      throw new NotFoundException('Note not found');
    }

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

  async updateNoteByUser(
    userId: string,
    id: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const [updatedNote] = await this.db
      .update(notes)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(notes.userId, userId), eq(notes.id, id)))
      .returning();

    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }

    return updatedNote;
  }
}
