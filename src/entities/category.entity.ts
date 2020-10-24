import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Length, IsString, IsDefined, IsBoolean, IsUUID } from 'class-validator';
import ValidableEntity from './validableEntity';
import Keyword from './keyword.entity';
import User from './user.entity';
import Transaction from './transaction.entity';

@Entity({ name: 'Categories' })
export default class Category extends ValidableEntity {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsUUID('4')
  id: string;

  @Column({ type: 'nvarchar', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @Length(0, 255)
  name: string;

  @Column() // Do not specify column type, to automatically convert TINYINT to boolean
  @IsDefined()
  @IsBoolean()
  matchAll: boolean;

  @OneToMany(() => Keyword, (keyword) => keyword.category, { cascade: true })
  keywords: Keyword[];

  @ManyToMany(() => Transaction, (transaction) => transaction.categories)
  transactions: Transaction[];
}
