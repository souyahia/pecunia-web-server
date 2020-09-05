import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import Keyword from './keyword.entity';
import User from './user.entity';
import Transaction from './transaction.entity';

@Entity({ name: 'Categories' })
export default class Category {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @Column({ type: 'nvarchar', length: 255  })
  name: string;

  @OneToMany(() => Keyword, keyword => keyword.category)
  keywords: Keyword[];

  @ManyToMany(() => Transaction, transaction => transaction.categories)
  transactions: Transaction[];
}