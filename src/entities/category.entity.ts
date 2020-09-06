import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import {
  Length,
  IsString,
  IsArray,
} from 'class-validator';
import ValidableEntity from './validableEntity';
import Keyword from './keyword.entity';
import User from './user.entity';
import Transaction from './transaction.entity';

@Entity({ name: 'Categories' })
export default class Category extends ValidableEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @Column({ type: 'nvarchar', length: 255  })
  @IsString()
  @Length(0, 255)
  name: string;

  @OneToMany(() => Keyword, keyword => keyword.category)
  @IsArray()
  keywords: Keyword[];

  @ManyToMany(() => Transaction, transaction => transaction.categories)
  transactions: Transaction[];
}