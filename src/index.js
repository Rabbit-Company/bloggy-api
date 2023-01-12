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

async function isUsernameRegistered(username){
	const { results } = await env.DB.prepare("SELECT username FROM creators WHERE username = ?").bind(username).all();
	if(results.length == 1) return true;
	return false;
}

router.post("/register", async request => {
	let json = {};
	let data = {};

	try{
		data = await request.json();
	}catch{
		json = { "error": 1000, "info": "Data needs to be submitted in json format." };
		return jsonResponse(json);
	}

	if(!data.username || !data.password || !data.email){
		json = { "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, email" };
		return jsonResponse(json);
	}

	if(!(/^([a-z][a-z0-9\-]{3,29})$/.test(data.username))){
		json = { "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." };
		return jsonResponse(json);
	}

	if(!(/^([a-z0-9]{128})$/.test(data.password))){
		json = { "error": 1003, "info": "Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters." };
		return jsonResponse(json);
	}

	if(!(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(data.email))){
		json = { "error": 1004, "info": "Invalid email address." };
		return jsonResponse(json);
	}

	if(await isUsernameRegistered(data.username)){
		json = { "error": 1005, "info": "Username is already registered." };
		return jsonResponse(json);
	}

	let date = new Date().toISOString().split('T')[0];
	const result = await env.DB.prepare("INSERT INTO creators(username, password, email, created, accessed) VALUES(?1, ?2, ?3, ?4, ?5)").bind(data.username, data.password, data.email, date, date).run();

	if(!result.success){
		json = { "error": 1006, "info": "Something went wrong while inserting data to the database. Please try again later." };
		return jsonResponse(json);
	}

	json = { "error": 0, "info": "Success" };
	return jsonResponse(json);
});

router.all("*", () => {
	let json = { "error": 404, "info": "Invalid API endpoint" };
	return jsonResponse(json, 404);
});

export default {
	async fetch(request, env2, ctx2){
		env = env2;
		ctx = ctx2;
		return router.handle(request);
	},
};