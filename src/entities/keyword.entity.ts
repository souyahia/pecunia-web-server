import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { IsString, Length, IsUUID } from 'class-validator';
import ValidableEntity from './validableEntity';
import Category from './category.entity';

@Entity({ name: 'Keywords' })
export default class Keyword extends ValidableEntity {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsUUID('4')
  id: string;

  @Column({ type: 'nvarchar', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, (category) => category.keywords)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @Length(0, 255)
  value: string;
}
