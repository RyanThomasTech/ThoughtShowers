Thought Showers
===============

Lightweight crowd-sourced brainstorming
--------------------------------------

###Setup Database

`CREATE TABLE user_status ("id" serial primary key, name varchar(100));
CREATE TABLE user_account ("id" serial primary key, username varchar(100), hashed_password varchar(100), name varchar (100), email varchar(254), created timestamp, is_moderator boolean, status varchar(100), user_status integer REFERENCES user_status(id));
CREATE TABLE status ("id" serial primary key, name varchar(100));
CREATE TABLE thread ("id" serial primary key, subject varchar(100), created timestamp, user_account_id integer REFERENCES user_account(id), status integer REFERENCES status(id));
CREATE TABLE post ("id" serial primary key, content varchar(500), created timestamp, thread_id integer REFERENCES thread(id), user_account_id integer REFERENCES user_account(id), status integer REFERENCES status(id));`
