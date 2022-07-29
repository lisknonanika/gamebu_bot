CREATE TABLE gamebu.manage (
  id varchar(45) NOT NULL,
  upd datetime,
  PRIMARY KEY(id)
);

CREATE TABLE gamebu.friend (
  code varchar(45) NOT NULL,
  name varchar(45) NOT NULL,
  game varchar(45),
  PRIMARY KEY(code)
);

CREATE TABLE gamebu.game (
  code varchar(45) NOT NULL,
  name varchar(45) NOT NULL,
  PRIMARY KEY(code)
);
