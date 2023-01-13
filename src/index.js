import { Router } from 'itty-router';
const router = Router();

const cache = caches.default;
let date;
let request;
let env;
let hashedIP;

const themes = ['light'];
const categories = ['Art and Design', 'Book and Writing', 'Business', 'Car', 'DIY Craft', 'Fashion and Beauty', 'Finance', 'Food', 'Gaming', 'Health and Fitness', 'Lifestyle', 'Movie', 'Music', 'News', 'Parenting', 'Personal', 'Pet', 'Political', 'Religion', 'Review', 'Sports', 'Technology', 'Travel'];
const languages = ['ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az','bm','ba','eu','be','bn','bh','bi','bs','br','bg','my','ca','km','ch','ce','ny','zh','cu','cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo','et','ee','fo','fj','fi','fr','ff','gd','gl','lg','ka','de','ki','el','kl','gn','gu','ht','ha','he','hz','hi','ho','hu','is','io','ig','id','ia','ie','iu','ik','ga','it','ja','jv','kn','kr','ks','kk','rw','kv','kg','ko','kj','ku','ky','lo','la','lv','lb','li','ln','lt','lu','mk','mg','ms','ml','mt','gv','mi','mr','mh','ro','mn','na','nv','nd','ng','ne','se','no','nb','nn','ii','oc','oj','or','om','os','pi','pa','ps','fa','pl','pt','qu','rm','rn','ru','sm','sg','sa','sc','sr','sn','sd','si','sk','sl','so','st','nr','es','su','sw','ss','sv','tl','ty','tg','ta','tt','te','th','bo','ti','to','ts','tn','tr','tk','tw','ug','uk','ur','uz','ve','vi','vo','wa','cy','fy','wo','xh','yi','yo','za','zu'];

function jsonResponse(json, statusCode = 200){
	if(typeof(json) !== 'string') json = JSON.stringify(json);
	return new Response(json, {
		headers: { "Content-Type": "application/json" },
		status: statusCode
	});
}

// Templates
const templateMain = "<!doctype html><html lang='::language::'><head><meta charset='UTF-8' /><meta name='viewport' content='width=device-width, initial-scale=1' /><title>::metatitle::</title><meta name='author' content='::author::' /><meta name='description' content='::metaDescription::' /><meta name='theme-color' content='#FFFFFF' /><meta property='og:title' content='::metatitle::' /><meta property='og:site_name' content='::metatitle::' /><meta property='og:description' content='::metaDescription::' /><meta property='og:url' content='::metaURL::' /><meta property='og:image' content='::metaURL::/images/logo.png' /><meta property='og:type' content='website' /><meta name='twitter:title' content='::metatitle::' /><meta name='twitter:description' content='::metaDescription::' /><meta name='twitter:creator' content='::metaTwitterCreator::' /><meta name='twitter:site' content='::metaTwitterSite::' /><meta name='twitter:domain' content='::metaDomain::' /><meta name='twitter:image' content='::metaURL::/images/logo.png' /><meta name='twitter:card' content='summary' /><link rel='icon' href='/images/logo.png' type='image/png' /><link rel='canonical' href='::metaURL::' /><link rel='manifest' href='/manifest.json' /><link type='text/css' rel='stylesheet' href='/css/tailwind.min.css' /><link type='text/css' rel='stylesheet' href='/css/index.css' />::analytics::<script type='application/ld+json'>::jsondl::</script></head><body class='bg-gray-50'><div class='relative bg-gray-50 px-6 pt-8 pb-5 lg:px-8 lg:pt-16'><div class='absolute inset-0'><div class='h-1/3 bg-gray-50 sm:h-2/3'></div></div><div class='relative mx-auto max-w-7xl'><div class='text-center'><a href='/'><h1 id='title' class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>::title::</h1></a><p id='description' class='mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4'>::description::</p><div id='social-media' class='mt-2 flex justify-center space-x-6 max-w-7xl mx-auto'>::social::</div></div><div id='creators' class='mx-auto max-w-7xl py-5 px-5 text-center'><ul role='list' class='mx-auto max-w-7xl space-y-8 sm:grid sm:grid-cols-3 sm:gap-8 sm:space-y-0 lg:grid-cols-4 xl:grid-cols-5'>::creators::</ul></div></div></div><script src='/js/default-functions.js'></script><script src='/metadata.js'></script><script src='/js/main.js'></script></body></html>";
const templateUser = "<!doctype html><html lang='::language::'><head><meta charset='UTF-8' /><meta name='viewport' content='width=device-width, initial-scale=1' /><title>::metatitle::</title><meta name='author' content='::author::' /><meta name='description' content='::metaDescription::' /><meta name='theme-color' content='#FFFFFF' /><meta property='og:title' content='::metatitle::' /><meta property='og:site_name' content='::siteName::' /><meta property='og:description' content='::metaDescription::' /><meta property='og:url' content='::metaURL::' /><meta property='og:image' content='::icon::' /><meta property='og:type' content='profile' /><meta property='profile:first_name' content='::author::' /><meta property='profile:username' content='::username::' /><meta name='twitter:title' content='::metatitle::' /><meta name='twitter:description' content='::metaDescription::' /><meta name='twitter:creator' content='::metaTwitterCreator::' /><meta name='twitter:site' content='::metaTwitterSite::' /><meta name='twitter:domain' content='::metaDomain::' /><meta name='twitter:image' content='::icon::' /><meta name='twitter:card' content='summary' /><link rel='icon' href='::icon::' type='image/png'><link rel='alternate' type='application/rss+xml' title='Subscribe' href='::metaRSS::' /><link rel='canonical' href='::metaURL::' /><link rel='manifest' href='/manifest.json' /><link type='text/css' rel='stylesheet' href='/css/tailwind.min.css'><link type='text/css' rel='stylesheet' href='/css/index.css'>::analytics::<script type='application/ld+json'>::jsondl::</script></head><body class='bg-gray-50'><div class='relative bg-gray-50 px-6 pt-8 pb-5 lg:px-8 lg:pt-16'><div class='absolute inset-0'><div class='h-1/3 bg-gray-50 sm:h-2/3'></div></div><div class='relative mx-auto max-w-7xl'><div class='text-center'><a href='::authorURL::'><h1 id='title' class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>::title::</h1></a><p id='description' class='mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4'>::description::</p><div id='social-media' class='mt-2 flex justify-center space-x-6 max-w-7xl mx-auto'>::social::</div></div><div class='mt-5 text-center'><input type='text' name='search' id='search' class='mx-auto border text-gray-500 border-gray-200 bg-gray-50 w-full max-w-lg lg:max-w-none rounded-lg px-4 py-2 shadow-lg text-xl focus:outline-none' placeholder='Search' enterkeyhint='search' /></div><div id='post' class='mx-auto mt-5 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3'>::post::</div></div></div><script src='/js/default-functions.js'></script><script src='/js/settings.js'></script><script src='/creator/::username::/metadata.js'></script><script src='/js/user.js'></script></body></html>";
const templatePost = "<!doctype html><html lang='::language::'><head><meta charset='UTF-8' /><meta name='viewport' content='width=device-width, initial-scale=1' /><title>::metatitle::</title><meta name='author' content='::metaAuthor::' /><meta name='description' content='::metaDescription::' /><meta name='keywords' content='::metaKeywords::' /><meta name='theme-color' content='#FFFFFF' /><meta property='og:title' content='::metatitle::' /><meta property='og:description' content='::metaDescription::' /><meta property='og:url' content='::metaURL::' /><meta property='og:image' content='::metaImage::' /><meta property='og:site_name' content='::siteName::' /><meta property='og:type' content='article' /><meta property='article:published_time' content='::metaPublishedTime::' /><meta property='article:modified_time' content='::metaModifiedTime::' /><meta property='article:author' content='::metaAuthor::' /><meta property='article:section' content='::metaCategory::' /><meta property='article:tag' content='::metaTag::' /><meta name='twitter:title' content='::metatitle::' /><meta name='twitter:description' content='::metaDescription::' /><meta name='twitter:creator' content='::metaTwitterCreator::' /><meta name='twitter:site' content='::metaTwitterSite::' /><meta name='twitter:domain' content='::metaDomain::' /><meta name='twitter:image' content='::metaImage::' /><meta name='twitter:card' content='summary_large_image' /><link rel='icon' href='::icon::' type='image/png' /><link rel='alternate' type='application/rss+xml' title='Subscribe' href='::metaRSS::' /><link rel='canonical' href='::metaURL::' /><link rel='manifest' href='/manifest.json' /><link type='text/css' rel='stylesheet' href='/css/tailwind.min.css' /><link type='text/css' rel='stylesheet' href='/css/index.css' /><link type='text/css' rel='stylesheet' href='/css/markdown.css' /><link type='text/css' rel='stylesheet' href='/css/default.min.css' />::analytics::<script type='application/ld+json'>::jsondl::</script></head><body class='bg-gray-50'><div class='relative bg-gray-50 px-6 pt-8 pb-8 lg:px-8 lg:pt-16 lg:pb-16'><div class='absolute inset-0'><div class='h-1/3 bg-gray-50 sm:h-2/3'></div></div><div class='relative mx-auto max-w-7xl'><div class='text-center'><a href='::previousLocation::'><h2 id='title' class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>::title::</h2></a><p id='description' class='mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4'>::description::</p><div id='social-media' class='mt-2 flex justify-center space-x-6 max-w-7xl mx-auto'>::social::</div></div><div id='post' class='markdown max-w-4xl mx-auto'>::post::</div><div class='max-w-4xl mx-auto'><a href='https://twitter.com/intent/tweet?text=::shareTwitter::' target='_blank' class='inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none'><svg class='-ml-1 mr-3 h-5 w-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path stroke='none' d='M0 0h24v24H0z' fill='none'></path><path d='M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z'></path></svg>Share on Twitter</a></div></div></div><script src='/js/default-functions.js'></script></body></html>";

function getRandomInt(max, min = 0) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function getWordCount(str) {
	return str.trim().split(/\s+/).length;
}

function isUsernameValid(username){
	if(typeof(username) !== 'string' || username === null) return false;
	return /^([a-z][a-z0-9\-]{3,29})$/.test(username);
}

function isPasswordValid(password){
	if(typeof(password) !== 'string' || password === null) return false;
	return /^([a-z0-9]{128})$/.test(password);
}

function isEmailValid(email){
	if(typeof(email) !== 'string' || email === null) return false;
	return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
}

function isOTPValid(otp){
	if(typeof(otp) !== 'string' || otp === null) return false;
	return (otp.length === 0 || otp.length === 6 || otp.length === 44);
}

function isTokenValid(token){
	if(typeof(token) !== 'string' || token === null) return false;
	return token.length === 128;
}

function isTitleValid(title){
	if(typeof(title) !== 'string' || title === null) return false;
	return (title.length >= 3 && title.length <= 30);
}

function isDescriptionValid(description){
	if(typeof(description) !== 'string' || description === null) return false;
	return (description.length >= 30 && description.length <= 160);
}

function isAuthorValid(author){
	if(typeof(author) !== 'string' || author === null) return false;
	return (author.length >= 5 && author.length <= 30);
}

function isCategoryValid(category){
	if(typeof(category) !== 'string' || category === null) return false;
	return categories.includes(category);
}

function isLanguageValid(language){
	if(typeof(language) !== 'string' || language === null) return false;
	return languages.includes(language);
}

function isThemeValid(theme){
	if(typeof(theme) !== 'string' || theme === null) return false;
	return themes.includes(theme);
}

function isPostIDValid(id){
	if(typeof(id) !== 'string' || id === null) return false;
	return /^([a-z][a-z0-9\-]{4,100})$/.test(id);
}

function isPostTitleValid(title){
	if(typeof(title) !== 'string' || title === null) return false;
	return (title.length >= 5 && title.length <= 100);
}

function isPostDescriptionValid(description){
	if(typeof(description) !== 'string' || description === null) return false;
	return (description.length >= 30 && description.length <= 300);
}

function isPostPictureValid(picture){
	if(typeof(picture) !== 'string' || picture === null) return false;
	return (picture.length >= 5 && picture.length <= 500);
}

function isPostTagValid(tag){
	if(typeof(tag) !== 'string' || tag === null) return false;
	return (tag.length >= 3 && tag.length <= 30);
}

function isPostkeywordsValid(keywords){
	if(typeof(keywords) !== 'string' || keywords === null) return false;
	if(keywords.length >= 255) return false;
	keywords = keywords.split(',');
	return (keywords.length >= 3 && keywords.length <= 20);
}

function isPostMarkdownValid(markdown){
	if(typeof(markdown) !== 'string' || markdown === null) return false;
	if(markdown.length > 100000) return false;
	let words = getWordCount(markdown);
	return (words >= 150 && words <= 10000);
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

async function setAdminValue(key, value, expirationTime = null, cacheTime = 60){
	let cacheKey = request.url + "?key=" + key;
	if(expirationTime === null){
		await env.AKV.put(key, value);
	}else{
		await env.AKV.put(key, value, { expirationTtl: expirationTime });
	}
	let nres = new Response(value);
	nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
	await cache.put(cacheKey, nres);
}

async function setPageValue(key, value, expirationTime = null, cacheTime = 60){
	let cacheKey = request.url + "?key=" + key;
	if(expirationTime === null){
		await env.PKV.put(key, value);
	}else{
		await env.PKV.put(key, value, { expirationTtl: expirationTime });
	}
	let nres = new Response(value);
	nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
	await cache.put(cacheKey, nres);
}

async function getAdminValue(key, cacheTime = 60){
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

async function getPageValue(key, cacheTime = 60){
	let value = null;

	let cacheKey = request.url + "?key=" + key;
	let res = await cache.match(cacheKey);
	if(res) value = await res.text();

	if(value == null){
		value = await env.PKV.get(key, { cacheTtl: cacheTime });
		let nres = new Response(value);
		nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
		if(value != null) await cache.put(cacheKey, nres);
	}

	return value;
}

async function deleteAdminValue(key){
	await env.AKV.delete(key);
	await cache.delete(request.url + "?key=" + key);
}

async function deletePageValue(key){
	await env.PKV.delete(key);
	await cache.delete(request.url + "?key=" + key);
}

async function forceGetToken(username){
	let token = null;
	let key = 'token-' + username + '-' + hashedIP;

	token = await getAdminValue(key);
	if(token == null){
		token = await generateHash(generateCodes());
		await setAdminValue(key, token, 86400);
	}

	return token;
}

async function isAuthorized(username, token){
	let key = 'token-' + username + '-' + hashedIP;
	let token2 = await getAdminValue(key);
	if(token2 === null) return false;
	if(token === token2) return true;
	return false;
}

async function isUsernameTaken(username){
	try{
		const { results } = await env.DB.prepare("SELECT username FROM creators WHERE username = ?").bind(username).all();
		if(results.length >= 1) return true;
	}catch{}
	return false;
}

async function isPostIDTaken(username, postID){
	try{
		const { results } = await env.DB.prepare("SELECT username FROM posts WHERE username = ?1 AND id = ?2").bind(username, postID).all();
		if(results.length >= 1) return true;
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
		const { results } = await env.DB.prepare("SELECT * FROM creators WHERE username = ?1 AND password = ?2").bind(data.username, password).all();
		if(results.length == 1){
			let token = await forceGetToken(data.username);
			let json = {
				"token": token,
				"username": results[0].username,
				"email": results[0].email,
				"title": results[0].title,
				"description": results[0].description,
				"author": results[0].author,
				"category": results[0].category,
				"language": results[0].language,
				"social": results[0].social,
				"theme": results[0].theme,
				"advertisement": results[0].advertisement,
				"accessed": results[0].accessed,
				"created": results[0].created
			};
			json.fa_enabled = (results[0].fa_secret !== null);
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

	if(!data.username || !data.password || !data.email || !data.title || !data.description || !data.author || !data.category || !data.language || !data.theme){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, password, email, title, description, author, category, language, theme" });
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

	if(!isCategoryValid(data.category)){
		return jsonResponse({ "error": 1012, "info": "Category is invalid." });
	}

	if(!isLanguageValid(data.language)){
		return jsonResponse({ "error": 1013, "info": "Language is invalid. Please use ISO 639-1." });
	}

	if(!isThemeValid(data.theme)){
		return jsonResponse({ "error": 1014, "info": "Theme is invalid." });
	}

	let password = await generateHash(data.password);
	try{
		await env.DB.prepare("INSERT INTO creators(username, password, email, title, description, author, category, language, theme, created, accessed) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)").bind(data.username, password, data.email, data.title, data.description, data.author, data.category, data.language, data.theme, date, date).run();
	}catch(error){
		return jsonResponse({ "error": 1005, "info": "Username is already registered." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/deleteAccount", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	try{
		await env.DB.prepare("DELETE FROM creators WHERE username = ?").bind(data.username).run();
	}catch(error){
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to delete your account. Please try again later." });
	}

	await deleteAdminValue('token-' + data.username + '-' + hashedIP);

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/createPost", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token || !data.id || !data.title || !data.description || !data.picture || !data.markdown || !data.category || !data.language || !data.tag || !data.keywords){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token, id, title, description, picture, markdown, category, language, tag, keywords" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!isPostIDValid(data.id)){
		return jsonResponse({ "error": 1018, "info": "Post ID can only contain lower case characters, numbers and hypens. It also need to be between 5 and 100 characters long." });
	}

	if(!isPostTitleValid(data.title)){
		return jsonResponse({ "error": 1019, "info": "Title needs to be between 5 and 100 characters long." });
	}

	if(!isPostDescriptionValid(data.description)){
		return jsonResponse({ "error": 1020, "info": "Description needs to be between 30 and 300 characters long." });
	}

	if(!isPostPictureValid(data.picture)){
		return jsonResponse({ "error": 1021, "info": "Picture needs to be between 5 and 500 characters long." });
	}

	if(!isPostMarkdownValid(data.markdown)){
		return jsonResponse({ "error": 1022, "info": "Post needs to be between 150 and 10000 words long." });
	}

	if(!isCategoryValid(data.category)){
		return jsonResponse({ "error": 1012, "info": "Category is invalid." });
	}

	if(!isLanguageValid(data.language)){
		return jsonResponse({ "error": 1013, "info": "Language is invalid. Please use ISO 639-1." });
	}

	if(!isPostTagValid(data.tag)){
		return jsonResponse({ "error": 1023, "info": "Tag needs to be between 3 and 30 characters long." });
	}

	if(!isPostkeywordsValid(data.keywords)){
		return jsonResponse({ "error": 1024, "info": "You need to have from 3 to 20 keywords. Keywords needs to be separated with comma and string can't be longer than 255 characters." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(await isPostIDTaken(data.username, data.id)){
		return jsonResponse({ "error": 1025, "info": "Post ID is already taken. Please use another post ID." })
	}

	let read = Math.round(getWordCount(data.markdown) / 200);
	try{
		await env.DB.prepare("INSERT INTO posts(id, username, title, description, picture, markdown, category, language, tag, keywords, created, read_time) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)").bind(data.id, data.username, data.title, data.description, data.picture, data.markdown, data.category, data.language, data.tag, data.keywords, date, read).run();
	}catch(error){
		return jsonResponse({ "error": 1026, "info": "Something went wrong while trying to store your post in the database." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/deletePost", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token || !data.id){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token, id" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!isPostIDValid(data.id)){
		return jsonResponse({ "error": 1018, "info": "Post ID can only contain lower case characters, numbers and hypens. It also need to be between 5 and 100 characters long." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(!(await isPostIDTaken(data.username, data.id))){
		return jsonResponse({ "error": 1027, "info": "This post doesn't exists." })
	}

	try{
		await env.DB.prepare("DELETE FROM posts WHERE username = ?1 AND id = ?2").bind(data.username, data.id).run();
	}catch(error){
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to delete your post. Please try again later." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/generatePages", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	let rUser = {};
	try{
		rUser = await env.DB.prepare("SELECT * FROM creators WHERE username = ?").bind(data.username).all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to fetch user data. Please try again later." });
	}
	rUser = rUser.results;

	let rPost = {};
	try{
		rPost = await env.DB.prepare("SELECT * FROM posts WHERE username = ?").bind(data.username).all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to fetch all posts. Please try again later." });
	}
	rPost = rPost.results;

	for(let i = 0; i < rPost.length; i++){
		let id = rPost[i].id;
		let username = rPost[i].username;
		let title = rPost[i].title;
		let description = rPost[i].description;
		let picture = (rPost[i].picture.startsWith('http')) ? rPost[i].picture : env.CDN + "/posts/" + username + "/" + rPost[i].picture;
		let markdown = rPost[i].markdown;
		let category = rPost[i].category;
		let language = rPost[i].language;
		let tag = rPost[i].tag;
		let keywords = rPost[i].keywords;
		let created = rPost[i].created;
		let read_time = rPost[i].read_time;

		let tempTemplate = templatePost;
		tempTemplate = tempTemplate.replaceAll("::metatitle::", title);

		return jsonResponse({"picture": picture, "html": tempTemplate});
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.all("*", () => {
	return jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
});

export default {
	async fetch(request2, env2){
		request = request2;
		env = env2;
		date = new Date().toISOString().split('T')[0];
		let IP = request2.headers.get('CF-Connecting-IP');
		hashedIP = await generateHash("rabbitcompany" + IP + date, 'SHA-256');
		return router.handle(request2);
	},
};