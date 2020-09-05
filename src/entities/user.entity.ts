import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import Transaction from './transaction.entity';
import Categories from './category.entity';

@Entity({ name: 'Users' })
export default class User {
  @PrimaryColumn({ type: 'nvarchar', length: 255  })
  id: string;

  @Column({ type: 'nvarchar', length: 255  })
  email: string;

  @Column({ type: 'nvarchar', length: 30  })
  password: string;

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Categories, category => category.user)
  categories: Categories[];
}