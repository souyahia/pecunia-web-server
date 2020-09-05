USE pecunia_db;

CREATE TABLE IF NOT EXISTS Users (
  id NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  password NVARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
) COMMENT='Users accounts table.';

CREATE TABLE IF NOT EXISTS Categories (
  id INTEGER(255) AUTO_INCREMENT NOT NULL,
  userId NVARCHAR(255) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES Users(id)
) COMMENT='Categories table.';

CREATE TABLE IF NOT EXISTS Keywords (
  id INTEGER(255) AUTO_INCREMENT NOT NULL,
  categoryId INTEGER(255) NOT NULL,
  value NVARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (categoryId) REFERENCES Categories(id)
) COMMENT='Keywords table.';

CREATE TABLE IF NOT EXISTS Transactions (
  id INTEGER(255) AUTO_INCREMENT NOT NULL,
  userId NVARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  amount FLOAT(24) NOT NULL,
  name NVARCHAR(255),
  type VARCHAR(11) NOT NULL,
  publicId VARCHAR(255),
  currency VARCHAR(3) NOT NULL,
  balance FLOAT(24) NOT NULL,
  bankId VARCHAR(9),
  accountNb VARCHAR(22),
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES Users(id),
  INDEX (userId)
) COMMENT='Transactions table.';

CREATE TABLE IF NOT EXISTS TransactionCategories (
  transactionId INTEGER(255) NOT NULL,
  categoryId INTEGER(255) NOT NULL,
  PRIMARY KEY (transactionId, categoryId),
  FOREIGN KEY (transactionId) REFERENCES Transactions(id),
  FOREIGN KEY (categoryId) REFERENCES Categories(id)
) COMMENT='Transactions and Categories join table.';
