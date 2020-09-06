import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Length, IsString, IsArray, IsEmail, IsUUID } from 'class-validator';
import ValidableEntity from './validableEntity';
import Transaction from './transaction.entity';
import Categories from './category.entity';

@Entity({ name: 'Users' })
export default class User extends ValidableEntity {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsUUID('4')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsEmail()
  email: string;

  @Column({ type: 'nvarchar', length: 30 })
  @IsString()
  @Length(0, 30)
  password: string;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  @IsArray()
  transactions: Transaction[];

  @OneToMany(() => Categories, (category) => category.user)
  @IsArray()
  categories: Categories[];
}
