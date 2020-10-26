USE pecunia_db;

CREATE TABLE IF NOT EXISTS Users (
  id NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(5) NOT NULL,
  PRIMARY KEY (id)
) COMMENT='Users accounts table.';

CREATE TABLE IF NOT EXISTS Categories (
  id NVARCHAR(255) NOT NULL,
  userId NVARCHAR(255),
  name NVARCHAR(255) NOT NULL,
  matchAll TINYINT(1),
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES Users(id)
) COMMENT='Categories table.';

CREATE TABLE IF NOT EXISTS Keywords (
  id NVARCHAR(255) NOT NULL,
  categoryId NVARCHAR(255),
  value NVARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (categoryId) REFERENCES Categories(id)
) COMMENT='Keywords table.';

CREATE TABLE IF NOT EXISTS Transactions (
  id NVARCHAR(255) NOT NULL,
  userId NVARCHAR(255),
  date DATETIME NOT NULL,
  amount FLOAT NOT NULL,
  name NVARCHAR(255),
  type VARCHAR(11) NOT NULL,
  publicId VARCHAR(255),
  currency VARCHAR(3) NOT NULL,
  balance FLOAT NOT NULL,
  bankId VARCHAR(9),
  accountId VARCHAR(22),
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES Users(id),
  INDEX (userId)
) COMMENT='Transactions table.';

CREATE TABLE IF NOT EXISTS TransactionCategories (
  transactionId NVARCHAR(255) NOT NULL,
  categoryId NVARCHAR(255) NOT NULL,
  PRIMARY KEY (transactionId, categoryId),
  FOREIGN KEY (transactionId) REFERENCES Transactions(id),
  FOREIGN KEY (categoryId) REFERENCES Categories(id)
) COMMENT='Transactions and Categories join table.';
