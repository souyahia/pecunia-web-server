import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Length, IsString, IsEmail, IsUUID, IsIn } from 'class-validator';
import ValidableEntity from './validableEntity';
import Transaction from './transaction.entity';
import Categories from './category.entity';
import { USER_ROLES } from '../auth';

@Entity({ name: 'Users' })
export default class User extends ValidableEntity {
  @PrimaryColumn({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsUUID('4')
  id?: string;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @IsEmail()
  email?: string;

  @Column({ type: 'nvarchar', length: 255 })
  @IsString()
  @Length(1, 255)
  password?: string;

  @Column({ type: 'nvarchar', length: 5 })
  @IsString()
  @IsIn(USER_ROLES)
  role?: string;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[];

  @OneToMany(() => Categories, (category) => category.user)
  categories?: Categories[];
}
