import { Router } from 'itty-router';

const router = Router();

function jsonResponse(json, statusCode = 200){
	if(typeof(json) !== 'string') json = JSON.stringify(json);
	return new Response(json, {
		headers: {
			"Content-Type": "application/json"
		},
		status: statusCode
	});
}

router.post("/register", async request => {
	let json = {};
	let data = {};

	try{
		data = await request.json();
	}catch{
		json = { "error": 1000, "info": "Data needs to be submitted in json format." }
		return jsonResponse(json);
	}

	if(!data.username || !data.password || !data.email){
		json = { "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, email" }
		return jsonResponse(json);
	}

	if(!(/^([a-z][a-z0-9\-]{3,29})$/.test(data.username))){
		json = { "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." }
		return jsonResponse(json);
	}

	if(!(/^([a-z0-9]{128})$/.test(data.password))){
		json = { "error": 1003, "info": "Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters." }
		return jsonResponse(json);
	}

	if(!(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(data.email))){
		json = { "error": 1004, "info": "Invalid email address." }
		return jsonResponse(json);
	}

	return jsonResponse(data);
});

router.all("*", () => {
	let json = { "error": 404, "info": "Invalid API endpoint" };
	return jsonResponse(json, 404);
});

export default {
	async fetch(request, env, ctx){
		return router.handle(request);
	},
};