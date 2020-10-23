import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, Length } from 'class-validator';
import ValidableEntity from './validableEntity';
import Category from './category.entity';

@Entity({ name: 'Keywords' })
export default class Keyword extends ValidableEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', nullable: true })
  categoryId?: number;

  @ManyToOne(() => Category, (category) => category.keywords)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @Length(0, 255)
  value: string;
}
