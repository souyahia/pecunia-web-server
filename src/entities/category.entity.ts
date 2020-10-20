import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { Length, IsString, IsDefined } from 'class-validator';
import ValidableEntity from './validableEntity';
import Keyword from './keyword.entity';
import User from './user.entity';
import Transaction from './transaction.entity';

@Entity({ name: 'Categories' })
export default class Category extends ValidableEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id?: number;

  @ManyToOne(() => User, (user) => user.transactions)
  user?: User;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @Length(0, 255)
  name?: string;

  @Column() // Do not specify column type, to automatically convert TINYINT to boolean
  @IsDefined()
  matchAll?: boolean;

  @OneToMany(() => Keyword, (keyword) => keyword.category)
  keywords?: Keyword[];

  @ManyToMany(() => Transaction, (transaction) => transaction.categories)
  transactions?: Transaction[];
}
