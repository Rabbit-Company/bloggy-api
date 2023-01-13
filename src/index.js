import { Router } from 'itty-router';
const router = Router();

const cache = caches.default;
let date;
let request;
let env;
let ctx;
let hashedIP;

function jsonResponse(json, statusCode = 200){
	if(typeof(json) !== 'string') json = JSON.stringify(json);
	return new Response(json, {
		headers: { "Content-Type": "application/json" },
		status: statusCode
	});
}

function getRandomInt(max, min = 0) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function isUsernameValid(username){
	return /^([a-z][a-z0-9\-]{3,29})$/.test(username);
}

function isPasswordValid(password){
	return /^([a-z0-9]{128})$/.test(password);
}

function isEmailValid(email){
	return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
}

function isOTPValid(otp){
	return (otp.length === 0 || otp.length === 6 || otp.length === 44);
}

function isTitleValid(title){
	return (title.length >= 3 && title.length <= 30);
}

function isDescriptionValid(description){
	return (description.length >= 30 && description.length <= 160);
}

function isAuthorValid(author){
	return (author.length >= 5 && author.length <= 30);
}

function generateNonce(){
	let nonce = "";
	for(let i = 0; i < 5; i++) nonce += getRandomInt(999999, 100000) + 'p';
	nonce = nonce.slice(0, -1);
	return nonce;
}

function generateCodes(){
	let codes = '';
	for(let i = 0; i < 10; i++) codes += getRandomInt(999999, 100000) + ';';
	codes = codes.slice(0, -1);
	return codes;
}

async function generateHash(message){
	const msgUint8 = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function setValue(key, value, expirationTime = 86400, cacheTime = 600){
	let cacheKey = request.url + "?key=" + key;
	await env.AKV.put(key, value, { expirationTtl: expirationTime });
	let nres = new Response(value);
	nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
	await cache.put(cacheKey, nres);
}

async function getValue(key, cacheTime = 600){
	let value = null;

	let cacheKey = request.url + "?key=" + key;
	let res = await cache.match(cacheKey);
	if(res) value = await res.text();

	if(value == null){
		value = await env.AKV.get(key, { cacheTtl: cacheTime });
		let nres = new Response(value);
		nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
		if(value != null) await cache.put(cacheKey, nres);
	}

	return value;
}

async function getToken(username){
	let token = null;
	let key = 'token-' + username + '-' + hashedIP;

	token = await getValue(key);
	if(token == null){
		token = await generateHash(generateCodes());
		await setValue(key, token);
	}

	return token;
}

async function isUsernameTaken(username){
	try{
		const { results } = await env.DB.prepare("SELECT username FROM creators WHERE username = ?").bind(username).all();
		if(results.length == 1) return true;
	}catch{}
	return false;
}

router.post("/login", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.password){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, password" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isPasswordValid(data.password)){
		return jsonResponse({ "error": 1003, "info": "Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters." });
	}

	if(!isOTPValid(data.otp)){
		return jsonResponse({ "error": 1006, "info": "OTP is invalid." });
	}

	if(!(await isUsernameTaken(data.username))){
		return jsonResponse({ "error": 1005, "info": "The username doesn't exists. Please register first." });
	}

	let password = await generateHash(data.password);
	try{
		const { results } = await env.DB.prepare("SELECT username, created, accessed FROM creators WHERE username = ?1 AND password = ?2").bind(data.username, password).all();
		if(results.length == 1){
			let token = await getToken(data.username);
			let json = {
				"token": token,
				"username": results[0].username,
				"accessed": results[0].accessed,
				"created": results[0].created
			};
			try{
				if(results[0].accessed != date) await env.DB.prepare("UPDATE creators SET accessed = ?1 WHERE username = ?2").bind(date, data.username).run();
			}catch{}
			return jsonResponse({ "error": 0, "info": "Success", "data": json });
		}
		return jsonResponse({ "error": 1007, "info": "Password is incorrect." });
	}catch{
		return jsonResponse({ "error": 1008, "info": "Something went wrong while connecting to the database." });
	}

});

router.post("/register", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.password || !data.email || !data.title || !data.description || !data.author){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, email, title, description, author" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isPasswordValid(data.password)){
		return jsonResponse({ "error": 1003, "info": "Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters." });
	}

	if(!isEmailValid(data.email)){
		return jsonResponse({ "error": 1004, "info": "Invalid email address." });
	}

	if(!isTitleValid(data.title)){
		return jsonResponse({ "error": 1009, "info": "Title needs to be between 3 and 30 characters long." });
	}

	if(!isDescriptionValid(data.description)){
		return jsonResponse({ "error": 1010, "info": "Description needs to be between 30 and 160 characters long." });
	}

	if(!isAuthorValid(data.author)){
		return jsonResponse({ "error": 1011, "info": "Author needs to be between 5 and 30 characters long." });
	}

	let password = await generateHash(data.password);
	try{
		await env.DB.prepare("INSERT INTO creators(username, password, email, created, accessed) VALUES(?1, ?2, ?3, ?4, ?5)").bind(data.username, password, data.email, date, date).run();
	}catch(error){
		return jsonResponse({ "error": 1005, "info": "Username is already registered." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.all("*", () => {
	return jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
});

export default {
	async fetch(request2, env2, ctx2){
		request = request2;
		env = env2;
		ctx = ctx2;
		date = new Date().toISOString().split('T')[0];
		let IP = request2.headers.get('CF-Connecting-IP');
		hashedIP = await generateHash("rabbitcompany" + IP + date, 'SHA-256');
		return router.handle(request2);
	},
};