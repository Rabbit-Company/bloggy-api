import { Router } from 'itty-router';
const router = Router();

let env;
let ctx;

function jsonResponse(json, statusCode = 200){
	if(typeof(json) !== 'string') json = JSON.stringify(json);
	return new Response(json, {
		headers: {
			"Content-Type": "application/json"
		},
		status: statusCode
	});
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

async function generateHash(value){
	value = new TextEncoder().encode(value);
	value = await crypto.subtle.digest({ name: 'SHA-512' }, value);
	value = Array.from(new Uint8Array(value));
	value = value.map(b => b.toString(16).padStart(2, '0')).join('');
	return value;
}

async function isUsernameRegistered(username){
	const { results } = await env.DB.prepare("SELECT username FROM creators WHERE username = ?").bind(username).all();
	if(results.length == 1) return true;
	return false;
}

async function authorizeCreator(username, password, otp){

}

router.post("/login", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.password || !data.otp){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, otp" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isPasswordValid(data.password)){
		return jsonResponse({ "error": 1003, "info": "Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters." });
	}
});

router.post("/register", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.password || !data.email){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, email" });
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

	let password = await generateHash(data.password);
	let date = new Date().toISOString().split('T')[0];
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
	async fetch(request, env2, ctx2){
		env = env2;
		ctx = ctx2;
		return router.handle(request);
	},
};