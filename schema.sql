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
	created TEXT,
	accessed TEXT
);