import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true })
  category: RecordCategory;

  @Prop({ default: Date.now })
  created: Date;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false })
  mbid?: string;

  @Prop({ type: [String], default: [] })
  tracklist: string[];
}

export const RecordSchema = SchemaFactory.createForClass(Record);

RecordSchema.index({ artist: 1, category: 1, format: 1 }); // Compound index for artist, category, and format
