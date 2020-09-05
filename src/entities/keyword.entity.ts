import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Category from './category.entity';

@Entity({ name: 'Keywords' })
export default class Keyword {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => Category, category => category.keywords)
  category: Category;

  @Column({ type: 'nvarchar', length: 255  })
  value: string;
}