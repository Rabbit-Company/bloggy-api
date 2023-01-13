CREATE TABLE creators (
	username TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	email TEXT NOT NULL,
	fa_secret TEXT,
	yubico_otp TEXT,
	backup_codes TEXT,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	author TEXT NOT NULL,
	category TEXT DEFAULT "Technology" NOT NULL,
	language TEXT DEFAULT "en" NOT NULL,
	social TEXT,
	theme TEXT DEFAULT "light" NOT NULL,
	advertisement TEXT,
	created TEXT NOT NULL,
	accessed TEXT NOT NULL
);

CREATE TABLE posts (
	id TEXT NOT NULL,
	username TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	picture TEXT NOT NULL,
	markdown TEXT NOT NULL,
	tag TEXT NOT NULL,
	keywords TEXT NOT NULL,
	category TEXT NOT NULL,
	language TEXT NOT NULL,
	date TEXT NOT NULL,
	read TEXT NOT NULL
);