import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import User from './user.entity';
import Category from './category.entity';

@Entity({ name: 'Transactions' })
export default class Transaction {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => User, user => user.transactions)
  @Index()
  user: User;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 11 })
  type: string;

  @ManyToMany(() => Category)
  @JoinTable({ name: 'TransactionCategories' })
  categories: Category[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  publicId: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'float' })
  balance: number;

  @Column({ type: 'varchar', length: 9, nullable: true })
  bankId: string;

  @Column({ type: 'varchar', length: 22, nullable: true })
  accountNb: string;
}