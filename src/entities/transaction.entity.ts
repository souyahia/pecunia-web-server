import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Length, IsDate, IsNumber, IsString, IsOptional, IsIn, IsUUID } from 'class-validator';
import ValidableEntity from './validableEntity';
import User from './user.entity';
import Category from './category.entity';
import { TRNTYPES, ISO_4217_CURRENCY_CODES } from '../business';

@Entity({ name: 'Transactions' })
export default class Transaction extends ValidableEntity {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsUUID('4')
  id: string;

  @Column({ type: 'nvarchar', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column({ type: 'datetime' })
  @IsDate()
  date: Date;

  @Column({ type: 'float' })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  amount: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  name?: string;

  @Column({ type: 'varchar', length: 11 })
  @IsString()
  @IsIn(TRNTYPES)
  type: string;

  @ManyToMany(() => Category)
  @JoinTable({ name: 'TransactionCategories' })
  categories: Category[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  publicId?: string;

  @Column({ type: 'varchar', length: 3 })
  @IsString()
  @IsIn(ISO_4217_CURRENCY_CODES)
  currency: string;

  @Column({ type: 'float' })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  balance: number;

  @Column({ type: 'varchar', length: 9, nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 9)
  bankId?: string;

  @Column({ type: 'varchar', length: 22, nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 22)
  accountId?: string;
}
