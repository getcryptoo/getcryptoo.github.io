create table "payments" (
  "id" integer primary key AUTOINCREMENT,
  "address" varchar(35),
  "name" varchar,
  "url" varchar,
  "email" varchar,
  "value" int, -- all tx in sat (include) unconfirmed
  "confirmedValue" int,
  "txHash" varchar,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- refs: 
--   auto increment id in sqlite: https://stackoverflow.com/questions/7905859/is-there-an-auto-increment-in-sqlite
--   default time in sqlite: https://stackoverflow.com/questions/200309/sqlite-database-default-time-value-now
