import { Router } from 'itty-router';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
const router = Router();

const cache = caches.default;
let date;
let env;
let hashedIP;

const themes = ['light'];
const categories = ['Art and Design', 'Book and Writing', 'Business', 'Car', 'DIY Craft', 'Fashion and Beauty', 'Finance', 'Food', 'Gaming', 'Health and Fitness', 'Lifestyle', 'Movie', 'Music', 'News', 'Parenting', 'Personal', 'Pet', 'Political', 'Religion', 'Review', 'Sports', 'Technology', 'Travel'];
const languages = ['ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az','bm','ba','eu','be','bn','bh','bi','bs','br','bg','my','ca','km','ch','ce','ny','zh','cu','cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo','et','ee','fo','fj','fi','fr','ff','gd','gl','lg','ka','de','ki','el','kl','gn','gu','ht','ha','he','hz','hi','ho','hu','is','io','ig','id','ia','ie','iu','ik','ga','it','ja','jv','kn','kr','ks','kk','rw','kv','kg','ko','kj','ku','ky','lo','la','lv','lb','li','ln','lt','lu','mk','mg','ms','ml','mt','gv','mi','mr','mh','ro','mn','na','nv','nd','ng','ne','se','no','nb','nn','ii','oc','oj','or','om','os','pi','pa','ps','fa','pl','pt','qu','rm','rn','ru','sm','sg','sa','sc','sr','sn','sd','si','sk','sl','so','st','nr','es','su','sw','ss','sv','tl','ty','tg','ta','tt','te','th','bo','ti','to','ts','tn','tr','tk','tw','ug','uk','ur','uz','ve','vi','vo','wa','cy','fy','wo','xh','yi','yo','za','zu'];
const supportedImageFileTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
const validSocialMedia = { 'website': false, 'discord': 'https://discord.gg/', 'twitter': 'https://twitter.com/', 'github': 'https://github.com/' }

function jsonResponse(json, statusCode = 200){
	if(typeof(json) !== 'string') json = JSON.stringify(json);
	return new Response(json, {
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Max-Age': '86400' },
		status: statusCode
	});
}

// Templates
const templateMain = `<!doctype html><html lang="::language::"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>::metatitle::</title><meta name="author" content="::author::" /><meta name="description" content="::metaDescription::" /><meta name="theme-color" content="#FFFFFF" /><meta property="og:title" content="::metatitle::" /><meta property="og:site_name" content="::metatitle::" /><meta property="og:description" content="::metaDescription::" /><meta property="og:url" content="::metaURL::" /><meta property="og:image" content="::metaURL::/images/logo.png" /><meta property="og:type" content="website" /><meta name="twitter:title" content="::metatitle::" /><meta name="twitter:description" content="::metaDescription::" /><meta name="twitter:creator" content="::metaTwitterCreator::" /><meta name="twitter:site" content="::metaTwitterSite::" /><meta name="twitter:domain" content="::metaDomain::" /><meta name="twitter:image" content="::metaURL::/images/logo.png" /><meta name="twitter:card" content="summary" /><link rel="icon" href="/images/logo.png" type="image/png" /><link rel="canonical" href="::metaURL::" /><link rel="manifest" href="/manifest.json" /><link type="text/css" rel="stylesheet" href="/css/tailwind.min.css" /><link type="text/css" rel="stylesheet" href="/css/index.css" />::analytics::<script type="application/ld+json">::jsondl::</script></head><body class="bg-gray-50"><div class="relative bg-gray-50 px-6 pt-8 pb-5 lg:px-8 lg:pt-16"><div class="absolute inset-0"><div class="h-1/3 bg-gray-50 sm:h-2/3"></div></div><div class="relative mx-auto max-w-7xl"><div class="text-center"><a href="/"><h1 id="title" class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">::title::</h1></a><p id="description" class="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">::description::</p><div id="social-media" class="mt-2 flex justify-center space-x-6 max-w-7xl mx-auto">::social::</div></div><div id="creators" class="mx-auto max-w-7xl py-5 px-5 text-center"><ul role="list" class="mx-auto max-w-7xl space-y-8 sm:grid sm:grid-cols-3 sm:gap-8 sm:space-y-0 lg:grid-cols-4 xl:grid-cols-5">::creators::</ul></div></div></div><script src="/js/default-functions.js"></script><script src="/metadata.js"></script><script src="/js/main.js"></script></body></html>`;
const templateUser = `<!doctype html><html lang="::language::"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>::metatitle::</title><meta name="author" content="::author::" /><meta name="description" content="::metaDescription::" /><meta name="theme-color" content="#FFFFFF" /><meta property="og:title" content="::metatitle::" /><meta property="og:site_name" content="::siteName::" /><meta property="og:description" content="::metaDescription::" /><meta property="og:url" content="::metaURL::" /><meta property="og:image" content="::icon::" /><meta property="og:type" content="profile" /><meta property="profile:first_name" content="::author::" /><meta property="profile:username" content="::username::" /><meta name="twitter:title" content="::metatitle::" /><meta name="twitter:description" content="::metaDescription::" /><meta name="twitter:creator" content="::metaTwitterCreator::" /><meta name="twitter:site" content="::metaTwitterSite::" /><meta name="twitter:domain" content="::metaDomain::" /><meta name="twitter:image" content="::icon::" /><meta name="twitter:card" content="summary" /><link rel="icon" href="::icon::" type="image/png"><link rel="alternate" type="application/rss+xml" title="Subscribe" href="::metaRSS::" /><link rel="alternate" type="application/atom+xml" title="Subscribe" href="::metaAtom::" /><link rel="alternate" type="application/feed+json" title="Subscribe" href="::metaJson::" /><link rel="canonical" href="::metaURL::" /><link rel="manifest" href="/manifest.json" /><link type="text/css" rel="stylesheet" href="/css/tailwind.min.css"><link type="text/css" rel="stylesheet" href="/css/index.css">::analytics::<script type="application/ld+json">::jsondl::</script></head><body class="bg-gray-50"><div class="relative bg-gray-50 px-6 pt-8 pb-5 lg:px-8 lg:pt-16"><div class="absolute inset-0"><div class="h-1/3 bg-gray-50 sm:h-2/3"></div></div><div class="relative mx-auto max-w-7xl"><div class="text-center"><a href="::authorURL::"><h1 id="title" class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">::title::</h1></a><p id="description" class="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">::description::</p><div id="social-media" class="mt-2 flex justify-center space-x-6 max-w-7xl mx-auto">::social::</div></div><div class="mt-5 text-center"><input type="text" name="search" id="search" class="mx-auto border text-gray-500 border-gray-200 bg-gray-50 w-full max-w-lg lg:max-w-none rounded-lg px-4 py-2 shadow-lg text-xl focus:outline-none" placeholder="Search" enterkeyhint="search" /></div><div id="post" class="mx-auto mt-5 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">::post::</div></div></div><script src="/js/default-functions.js"></script><script src="/creator/::username::/metadata.js"></script><script src="/js/user.js"></script></body></html>`;
const templatePost = `<!doctype html><html lang="::language::"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>::metatitle::</title><meta name="author" content="::metaAuthor::" /><meta name="description" content="::metaDescription::" /><meta name="keywords" content="::metaKeywords::" /><meta name="theme-color" content="#FFFFFF" /><meta property="og:title" content="::metatitle::" /><meta property="og:description" content="::metaDescription::" /><meta property="og:url" content="::metaURL::" /><meta property="og:image" content="::metaImage::" /><meta property="og:site_name" content="::siteName::" /><meta property="og:type" content="article" /><meta property="article:published_time" content="::metaPublishedTime::" /><meta property="article:modified_time" content="::metaModifiedTime::" /><meta property="article:author" content="::metaAuthor::" /><meta property="article:section" content="::metaCategory::" /><meta property="article:tag" content="::metaTag::" /><meta name="twitter:title" content="::metatitle::" /><meta name="twitter:description" content="::metaDescription::" /><meta name="twitter:creator" content="::metaTwitterCreator::" /><meta name="twitter:site" content="::metaTwitterSite::" /><meta name="twitter:domain" content="::metaDomain::" /><meta name="twitter:image" content="::metaImage::" /><meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="::icon::" type="image/png" /><link rel="alternate" type="application/rss+xml" title="Subscribe" href="::metaRSS::" /><link rel="alternate" type="application/atom+xml" title="Subscribe" href="::metaAtom::" /><link rel="alternate" type="application/feed+json" title="Subscribe" href="::metaJson::" /><link rel="canonical" href="::metaURL::" /><link rel="manifest" href="/manifest.json" /><link type="text/css" rel="stylesheet" href="/css/tailwind.min.css" /><link type="text/css" rel="stylesheet" href="/css/index.css" /><link type="text/css" rel="stylesheet" href="/css/markdown.css" /><link type="text/css" rel="stylesheet" href="/css/default.min.css" />::analytics::<script type="application/ld+json">::jsondl::</script></head><body class="bg-gray-50"><div class="relative bg-gray-50 px-6 pt-8 pb-8 lg:px-8 lg:pt-16 lg:pb-16"><div class="absolute inset-0"><div class="h-1/3 bg-gray-50 sm:h-2/3"></div></div><div class="relative mx-auto max-w-7xl"><div class="text-center"><a href="::previousLocation::"><h2 id="title" class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">::title::</h2></a><p id="description" class="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">::description::</p><div id="social-media" class="mt-2 flex justify-center space-x-6 max-w-7xl mx-auto">::social::</div></div><div id="post" class="markdown max-w-4xl mx-auto">::post::</div><div class="max-w-4xl mx-auto"><a href="https://twitter.com/intent/tweet?text=::shareTwitter::" target="_blank" class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"><svg class="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path></svg>Share on Twitter</a></div></div></div><script src="/js/default-functions.js"></script></body></html>`;

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

function isUUIDValid(uuid){
	if(typeof(uuid) !== 'string' || uuid === null) return false;
	return uuidValidate(uuid);
}

function isURLValid(url){
	try{
		new URL(url);
		return true;
	}catch{}
	return false;
}

function isSocialValid(social){
	if(typeof(social) !== 'object') return false;
	let keys = Object.keys(social);
	let vsm = Object.keys(validSocialMedia);
	if(keys.length > 10) return false;
	for(let i = 0; i < keys.length; i++){
		let platform = keys[i];
		if(!vsm.includes(platform)) return false;
		let url = social[keys[i]];
		if(!isURLValid(url)) return false;
		let validator = validSocialMedia[platform];
		if(validator != false){
			if(!url.startsWith(validator)) return false;
		}
	}
	return true;
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
	let cacheKey = "https://api.bloggy.io?key=" + key;
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
	let cacheKey = "https://api.bloggy.io?key=" + key;
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

	let cacheKey = "https://api.bloggy.io?key=" + key;
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

	let cacheKey = "https://api.bloggy.io?key=" + key;
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
	await cache.delete("https://api.bloggy.io?key=" + key);
}

async function deletePageValue(key){
	await env.PKV.delete(key);
	await cache.delete("https://api.bloggy.io?key=" + key);
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

function basicAuthentication(request) {
  const Authorization = request.headers.get('Authorization');
  const [scheme, encoded] = Authorization.split(' ');
  if (!encoded || scheme !== 'Basic') return null;
  const buffer = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const decoded = new TextDecoder().decode(buffer).normalize();

  const index = decoded.indexOf(':');
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) return null;

  return { user: decoded.substring(0, index), pass: decoded.substring(index + 1) };
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
		let { results } = await env.DB.prepare("SELECT * FROM creators WHERE username = ?1 AND password = ?2").bind(data.username, password).all();
		if(results.length == 1){
			let userData = results[0];
			try{
				let results = await env.DB.prepare("SELECT * FROM posts WHERE username = ?1 ORDER BY created DESC").bind(data.username).all();
				let postData = results.results;
				let token = await forceGetToken(data.username);
				let userJson = {
					"token": token,
					"username": userData.username,
					"email": userData.email,
					"title": userData.title,
					"description": userData.description,
					"author": userData.author,
					"category": userData.category,
					"language": userData.language,
					"social": null,
					"theme": userData.theme,
					"advertisement": userData.advertisement,
					"yubico": userData.yubico_otp,
					"accessed": userData.accessed,
					"created": userData.created
				};
				userJson.fa_enabled = (userData.fa_secret !== null);
				try{
					userJson.social = JSON.parse(userData.social);
				}catch{}
				try{
					if(userData.accessed != date) await env.DB.prepare("UPDATE creators SET accessed = ?1 WHERE username = ?2").bind(date, data.username).run();
				}catch{}
				return jsonResponse({ "error": 0, "info": "Success", "data": { "user": userJson, "posts": postData } });
			}catch(err){
				return jsonResponse({ "error": 1028, "info": "Something went wrong while connecting to the database.", "err": err.message });
			}
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
	let options = { httpMetadata: { contentType: 'image/svg+xml' }};
	try{
		await env.R2.put("avatars/" + data.username, `<svg xmlns="http://www.w3.org/2000/svg" width="532" height="532" viewBox="0 0 532 532" xmlns:xlink="http://www.w3.org/1999/xlink"><circle cx="270.75986" cy="260.93427" r="86.34897" fill="#ffb6b6"/><polygon points="221.18982 360.05209 217.28876 320.6185 295.18982 306.05209 341.18982 418.05209 261.18982 510.05209 204.18982 398.05209 221.18982 360.05209" fill="#ffb6b6"/><path d="m216.0374,340.35736l17.03111,3.84802s-13.38821-42.45453-8.84396-46.50766c4.54427-4.05316,15.68007,2.33328,15.68007,2.33328l11.70201,13.1199,14.25394-14.51239s15.47495-19.2421,21.53397-24.6463-3.67319-25.46364-3.67319-25.46364c0,0,89.89185-24.23923,56.44299-67.83968,0,0-19.61093-34.18452-25.99734-23.04871-6.38641,11.1358-14.00162-6.55013-14.00162-6.55013l-23.25381,4.42198s-45.89429-27.06042-89.45331,30.82959c-43.55902,57.89003,28.57916,154.01572,28.57916,154.01572h-.00002Z" fill="#2f2e41"/><path d="m433.16003,472.95001c-47.19,38.26001-105.57001,59.04999-167.16003,59.04999-56.23999,0-109.81-17.33997-154.62-49.47998.08002-.84003.16003-1.66998.23004-2.5,1.19-13,2.25-25.64001,2.94995-36.12,2.71002-40.69,97.64001-67.81,97.64001-67.81,0,0,.42999.42999,1.29004,1.17999,5.23999,4.59998,26.50995,21.27997,63.81,25.94,33.25995,4.15997,44.20996-15.57001,47.51996-25.02002,1-2.88,1.30005-4.81,1.30005-4.81l97.63995,46.10999c6.37,9.10004,8.86005,28.70001,9.35004,50.73004.01996.90997.03998,1.81.04999,2.72998Z" fill="#6c63ff"/><path d="m454.09003,77.91003C403.85004,27.66998,337.05005,0,266,0S128.15002,27.66998,77.91003,77.91003C27.67004,128.15002,0,194.95001,0,266c0,64.85004,23.05005,126.16003,65.29004,174.57001,4.02997,4.63,8.23999,9.14001,12.62,13.52002,1.02997,1.02997,2.07001,2.06,3.12,3.06,2.79999,2.70996,5.65002,5.35999,8.54999,7.92999,1.76001,1.57001,3.54004,3.10999,5.34003,4.62,1.40997,1.19,2.82001,2.35999,4.25,3.51001.02997.02997.04999.04999.07996.07001,3.97003,3.19995,8.01001,6.27997,12.13,9.23999,44.81,32.14001,98.37999,49.47998,154.61998,49.47998,61.59003,0,119.97003-20.78998,167.16003-59.04999,3.84998-3.12,7.62-6.35999,11.32001-9.71002,3.26996-2.95996,6.46997-6.01001,9.60999-9.14996.98999-.98999,1.97998-1.98999,2.95001-3,2.70001-2.78003,5.32001-5.61005,7.88-8.48004,43.37-48.71997,67.07996-110.83997,67.07996-176.60999,0-71.04999-27.66998-137.84998-77.90997-188.08997Zm10.17999,362.20997c-2.5,2.84003-5.06,5.64001-7.67999,8.37-4.08002,4.25-8.28998,8.37-12.64001,12.34003-1.64996,1.52002-3.32001,3-5.01001,4.46997-1.91998,1.67004-3.85999,3.31-5.82996,4.92004-15.53003,12.75-32.54004,23.75-50.73004,32.70996-7.19,3.54999-14.56,6.78003-22.09998,9.67004-29.28998,11.23999-61.08002,17.39996-94.28003,17.39996-32.03998,0-62.75995-5.73999-91.19-16.23999-11.66998-4.29999-22.94995-9.40997-33.77997-15.26001-1.59003-.85999-3.16998-1.72998-4.73999-2.62-8.26001-4.67999-16.25-9.78998-23.91998-15.31-.25-.17999-.51001-.37-.76001-.54999-5.46002-3.94-10.77002-8.09003-15.90002-12.45001-1.88-1.59003-3.73999-3.20001-5.57001-4.84998-2.97998-2.65002-5.89996-5.38-8.75-8.18005-5.39996-5.28998-10.56-10.79999-15.48999-16.52997C26.09003,391.77002,2,331.65002,2,266,2,120.42999,120.43005,2,266,2s264,118.42999,264,264c0,66.66003-24.82996,127.62-65.72998,174.12Z" fill="#3f3d56"/></svg>`, options);
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

	let rPost = {};
	try{
		rPost = await env.DB.prepare("SELECT * FROM posts WHERE username = ?").bind(data.username).all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to delete your account. Please try again later." });
	}
	let ids = rPost.results.map(result => result.id);

	try{
		const images = await env.R2.list({ prefix: `images/${data.username}/`, delimiter: '/' });
		let keys = images.objects.map(obj => obj.key);
		if(keys.length !== 0) await env.R2.delete(keys);

		await env.R2.delete("avatars/" + data.username);

		for(let i = 0; i < ids.length; i++){
			await deletePageValue(`post_${data.username}_${ids[i]}`);
		}

		await env.DB.prepare("DELETE FROM posts WHERE username = ?").bind(data.username).run();
		await env.DB.prepare("DELETE FROM creators WHERE username = ?").bind(data.username).run();

		await deletePageValue("feed_rss_" + data.username);
		await deletePageValue("feed_atom_" + data.username);
		await deletePageValue("feed_json_" + data.username);
		await deletePageValue("content_" + data.username);
		await deletePageValue("metadata_" + data.username);

		await deleteAdminValue('token-' + data.username + '-' + hashedIP);
	}catch(error){
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to delete your account. Please try again later." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/getPosts", async request => {
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
		const { results } = await env.DB.prepare("SELECT * FROM posts WHERE username = ? ORDER BY created DESC").bind(data.username).all();
		return jsonResponse({ "error": 0, "info": "Success", "data": results });
	}catch{};
	return jsonResponse({ "error": 1008, "info": "Something went wrong while connecting to the database." });
});

router.put("/saveAvatar", async request => {
	if(!request.headers.has('Authorization')) {
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(!request.headers.has('Content-Type')) {
		return jsonResponse({ "error": 1031, "info": "Content-Type header needs to be provided." });
	}

	let contentType = request.headers.get('Content-Type');
	if(!supportedImageFileTypes.includes(contentType)){
		return jsonResponse({ "error": 1032, "info": "File type is not supported. Please upload .png, .jpg, .gif, .svg or .webp" });
	}

	let fileSize = request.headers.get('Content-Length');
	if(fileSize > 300_000){
		return jsonResponse({ "error": 1029, "info": "Avatars can't be bigger than 300kB. Please choose smaller image." });
	}

	const auth = basicAuthentication(request);
	if(auth == null){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(!isUsernameValid(auth.user)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(auth.pass)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!(await isAuthorized(auth.user, auth.pass))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	const options = {
		httpMetadata: {
			contentType: contentType,
		},
	}

	await env.R2.put("avatars/" + auth.user, request.body, options);
	return jsonResponse({ "error": 0, "info": "Success" });
});

router.put("/saveImage", async request => {
	if(!request.headers.has('Authorization')) {
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(!request.headers.has('Content-Type')) {
		return jsonResponse({ "error": 1031, "info": "Content-Type header needs to be provided." });
	}

	let contentType = request.headers.get('Content-Type');
	if(!supportedImageFileTypes.includes(contentType)){
		return jsonResponse({ "error": 1032, "info": "File type is not supported. Please upload .png, .jpg, .gif, .svg or .webp" });
	}

	let fileSize = request.headers.get('Content-Length');
	if(fileSize > 1_000_000){
		return jsonResponse({ "error": 1029, "info": "Image can't be bigger than 1MB. Please choose smaller image." });
	}

	const auth = basicAuthentication(request);
	if(auth == null){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	if(!isUsernameValid(auth.user)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(auth.pass)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!(await isAuthorized(auth.user, auth.pass))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	const options = {
		httpMetadata: {
			contentType: contentType,
		},
	}

	await env.R2.put("images/" + auth.user + "/" + uuidv4(), request.body, options);
	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/getImages", async request => {
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
		let images = await env.R2.list({ prefix: `images/${data.username}/`, delimiter: '/' });
		images = images.objects;
		let jsonImages = [];
		for(let i = 0; i < images.length; i++){
			let key = images[i].key.split('/')[2];
			let uploaded = images[i].uploaded;
			let size = images[i].size;
			jsonImages.push({ key: key, uploaded: uploaded, size: size });
		}
		return jsonResponse({ "error": 0, "info": "Success", "images": jsonImages });
	}catch{};
	return jsonResponse({ "error": 1008, "info": "Something went wrong while trying to get the images." });
});

router.post("/deleteImage", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token || !data.image){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token, image" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!isUUIDValid(data.image)){
		return jsonResponse({ "error": 1030, "info": "Image name is invalid." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	try{
		await env.R2.delete("images/" + data.username + "/" + data.image);
		return jsonResponse({ "error": 0, "info": "Success" });
	}catch{};
	return jsonResponse({ "error": 1008, "info": "Something went wrong while trying to delete the image." });
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
		await env.DB.prepare("INSERT INTO posts(id, username, title, description, picture, markdown, category, language, tag, keywords, created, read_time) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)").bind(data.id, data.username, data.title, data.description, data.picture, data.markdown, data.category, data.language, data.tag, data.keywords, new Date().toISOString(), read).run();
	}catch(error){
		return jsonResponse({ "error": 1026, "info": "Something went wrong while trying to store your post in the database." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/editPost", async request => {
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

	if(!(await isPostIDTaken(data.username, data.id))){
		return jsonResponse({ "error": 1025, "info": "You can't edit post that doesn't exists. Please create post first." });
	}

	let read = Math.round(getWordCount(data.markdown) / 200);
	try{
		await env.DB.prepare("UPDATE posts SET title = ?, description = ?, picture = ?, markdown = ?, category = ?, language = ?, tag = ?, keywords = ?, read_time = ? WHERE username = ? AND id = ?").bind(data.title, data.description, data.picture, data.markdown, data.category, data.language, data.tag, data.keywords, read, data.username, data.id).run();
	}catch(error){
		return jsonResponse({ "error": 1026, "info": "Something went wrong while trying to edit your post." });
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

router.post("/updateSettings", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token || !data.title || !data.description || !data.author || !data.category || !data.language || !data.theme){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token, title, description, author, category, language, theme" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
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

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	try{
		await env.DB.prepare("UPDATE creators SET title = ?, description = ?, author = ?, category = ?, language = ?, theme = ? WHERE username = ?").bind(data.title, data.description, data.author, data.category, data.language, data.theme, data.username).run();
	}catch(error){
		return jsonResponse({ "error": 1026, "info": "Something went wrong while trying to update blog settings." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.post("/updateSocialMedia", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token || !data.social){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token, social" });
	}

	if(!isUsernameValid(data.username)){
		return jsonResponse({ "error": 1002, "info": "Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long." });
	}

	if(!isTokenValid(data.token)){
		return jsonResponse({ "error": 1015, "info": "Token is invalid. Please login first to get the token." });
	}

	if(!isSocialValid(data.social)){
		return jsonResponse({ "error": 1033, "info": "Social media is invalid." });
	}

	if(!(await isAuthorized(data.username, data.token))){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	try{
		await env.DB.prepare("UPDATE creators SET social = ? WHERE username = ?").bind(JSON.stringify(data.social), data.username).run();
	}catch(error){
		return jsonResponse({ "error": 1026, "info": "Something went wrong while trying to update social media." });
	}

	return jsonResponse({ "error": 0, "info": "Success" });
});

async function generateMainPage(){
	// Robots
	let robots = `User-agent: *\nDisallow: /cgi-bin/\nSitemap: ${env.DOMAIN}/sitemap.xml`;
	await setPageValue('robots', robots);

	// Service Worker
	let serviceWorker = `let stamp = ${new Date().getTime()};const CACHE="pwa";importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"),self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),workbox.routing.registerRoute(({request:e,url:a})=>"navigate"===e.mode&&!a.pathname.startsWith("https://analytics"),new workbox.strategies.StaleWhileRevalidate({cacheName:"pwa"}));`;
	await setPageValue('service-worker', serviceWorker);

	// Manifest
	let manifest = `{"name":"${env.TITLE}","short_name":"${env.TITLE}","id":"/","start_url":"/","scope":".","description":"${env.DESCRIPTION}","categories":["entertainment","news","social"],"icons":[{"src":"images/icons/icon-48x48.png","sizes":"48x48","type":"image/png"},{"src":"images/icons/icon-72x72.png","sizes":"72x72","type":"image/png"},{"src":"images/icons/icon-96x96.png","sizes":"96x96","type":"image/png"},{"src":"images/icons/icon-128x128.png","sizes":"128x128","type":"image/png"},{"src":"images/icons/icon-144x144.png","sizes":"144x144","type":"image/png"},{"src":"images/icons/icon-152x152.png","sizes":"152x152","type":"image/png"},{"src":"images/icons/icon-192x192.png","sizes":"192x192","type":"image/png"},{"src":"images/icons/icon-384x384.png","sizes":"384x384","type":"image/png"},{"src":"images/icons/icon-512x512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"images/icons/icon-512x512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}],"screenshots":[{"src":"/images/screenshots/1.jpeg","sizes":"720x1600","type":"image/jpg"},{"src":"/images/screenshots/2.jpeg","sizes":"720x1600","type":"image/jpg"},{"src":"/images/screenshots/3.jpeg","sizes":"720x1600","type":"image/jpg"}],"theme_color":"#0D1117","background_color":"#0D1117","display":"standalone","orientation":"portrait","related_applications":[],"dir":"ltr","lang":"${env.LANGUAGE}"}`;
	await setPageValue('manifest', manifest);

	let rUsers = {};
	try{
		rUsers = await env.DB.prepare("SELECT username, author, category, language FROM creators ORDER BY accessed DESC").all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to fetch users. Please try again later." });
	}
	rUsers = rUsers.results;

	let rPosts = {};
	try{
		rPosts = await env.DB.prepare("SELECT id, username FROM posts ORDER BY created DESC").all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to fetch posts. Please try again later." });
	}
	rPosts = rPosts.results;

	let creators = {};
	for(let i = 0; i < rUsers.length; i++){
		let username = rUsers[i].username;
		creators[username] = {};
		creators[username].title = rUsers[i].title;
		creators[username].author = rUsers[i].author;
		creators[username].category = rUsers[i].category;
		creators[username].language = rUsers[i].language;
	}

	// Metadata
	let metadata = `var DOMAIN = "${env.DOMAIN}"; var CDN = "${env.CDN}"; var CREATORS = ${JSON.stringify(creators)};`;
	await setPageValue('metadata', metadata);

	// Main Page
	let tempTemplate = templateMain;
	tempTemplate = tempTemplate.replaceAll("::metatitle::", env.TITLE);
	tempTemplate = tempTemplate.replaceAll("::metaDescription::", env.DESCRIPTION);
	tempTemplate = tempTemplate.replaceAll("::title::", env.TITLE);
	tempTemplate = tempTemplate.replaceAll("::description::", env.DESCRIPTION);
	tempTemplate = tempTemplate.replaceAll("::author::", env.AUTHOR);
	tempTemplate = tempTemplate.replaceAll("::language::", env.LANGUAGE);
	tempTemplate = tempTemplate.replaceAll("::metaURL::", env.DOMAIN);
	tempTemplate = tempTemplate.replaceAll("::analytics::", env.ANALYTICS);
	tempTemplate = tempTemplate.replaceAll("::metaDomain::", env.DOMAIN.replace("https://", ""));
	tempTemplate = tempTemplate.replaceAll("::metaTwitterSite::", env.TWITTER.replace("https://twitter.com/", "@"));
	tempTemplate = tempTemplate.replaceAll("::metaTwitterCreator::", env.TWITTER.replace("https://twitter.com/", "@"));

	let social = "";
	if(typeof(env.WEBSITE) === 'string') social += `<a href="${env.WEBSITE}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Website</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19.5 7a8.998 8.998 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"></path><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4"></path><path d="M12.5 3a16.989 16.989 0 0 1 1.828 4.004"></path><path d="M19.5 17a8.998 8.998 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4"></path><path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"></path><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4.004"></path><path d="M2 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4"></path></svg></a>`;
	if(typeof(env.DISCORD) === 'string') social += `<a href="${env.DISCORD}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Discord</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M7.5 7.5c3.5 -1 5.5 -1 9 0"></path><path d="M7 16.5c3.5 1 6.5 1 10 0"></path><path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5"></path><path d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l1 2.5"></path></svg></a>`;
	if(typeof(env.TWITTER) === 'string') social += `<a href="${env.TWITTER}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Twitter</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path></svg></a>`;
	if(typeof(env.GITHUB) === 'string') social += `<a href="${env.GITHUB}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Github</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path></svg></a>`;
	tempTemplate = tempTemplate.replaceAll("::social::", social);

	let logo = env.DOMAIN + "/images/logo.png";
	const jsondl = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"url": env.DOMAIN,
		"logo": logo
	};
	tempTemplate = tempTemplate.replaceAll("::jsondl::", JSON.stringify(jsondl));

	let html = "";
	let amount = 20;
	for(let i = 0; i < rUsers.length; i++){
		if(i >= amount) break;
		let username = rUsers[i].username;
		let author = rUsers[i].author;
		let avatar = env.CDN + "/avatars/" + username;
		html += `<li><div class="space-y-6"><a href="/creator/${username}"><img class="mx-auto h-40 w-40 shadow-lg rounded-full" src="${avatar}" alt="${author}" /></a><div class="space-y-2"><div class="space-y-1 text-lg font-medium leading-6"><a href="/creator/${username}"><h2>${author}</h2></a></div></div></div></li>`;
	}
	tempTemplate = tempTemplate.replaceAll("::creators::", html);
	await setPageValue('main', tempTemplate);

	// Site Map
	let siteMap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"><url><loc>${env.DOMAIN}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
	for(let i = 0; i < rUsers.length; i++){
		siteMap += `<url><loc>${env.DOMAIN}/creator/${rUsers[i].username}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;
	}

	for(let i = 0; i < rPosts.length; i++){
		siteMap += `<url><loc>${env.DOMAIN}/creator/${rPosts[i].username}/${rPosts[i].id}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
	}
	siteMap += "</urlset>";
	await setPageValue('sitemap', siteMap);

	return jsonResponse({ "error": 0, "info": "Success" });
}

router.post("/generateMainPage", async request => {
	let data = {};

	try{
		data = await request.json();
	}catch{
		return jsonResponse({ "error": 1000, "info": "Data needs to be submitted in json format." });
	}

	if(!data.username || !data.token){
		return jsonResponse({ "error": 1001, "info": "Not all required data provided in json format. Required data: username, token" });
	}

	if(data.username !== "admin" || data.token !== env.TOKEN){
		return jsonResponse({ "error": 1016, "info": "You are not authorized to perform this action." });
	}

	return await generateMainPage();
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
	rUser = rUser.results[0];

	let rPost = {};
	try{
		rPost = await env.DB.prepare("SELECT * FROM posts WHERE username = ? ORDER BY created DESC").bind(data.username).all();
	}catch{
		return jsonResponse({ "error": 1017, "info": "Something went wrong while trying to fetch all posts. Please try again later." });
	}
	rPost = rPost.results;

	let link = env.DOMAIN + "/creator/" + data.username;
	let avatar = env.CDN + "/avatars/" + data.username;

	try{
		rUser.social = JSON.parse(rUser.social);
	}catch{}

	let social = "";
	if(typeof(rUser.social?.website) === 'string') social += `<a href="${rUser.social.website}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Website</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19.5 7a8.998 8.998 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"></path><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4"></path><path d="M12.5 3a16.989 16.989 0 0 1 1.828 4.004"></path><path d="M19.5 17a8.998 8.998 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4"></path><path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"></path><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4.004"></path><path d="M2 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4"></path></svg></a>`;
	if(typeof(rUser.social?.discord) === 'string') social += `<a href="${rUser.social.discord}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Discord</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M7.5 7.5c3.5 -1 5.5 -1 9 0"></path><path d="M7 16.5c3.5 1 6.5 1 10 0"></path><path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5"></path><path d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l1 2.5"></path></svg></a>`;
	if(typeof(rUser.social?.twitter) === 'string') social += `<a href="${rUser.social.twitter}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Twitter</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z"></path></svg></a>`;
	if(typeof(rUser.social?.github) === 'string') social += `<a href="${rUser.social.github}" target="_blank" class="text-gray-500 hover:text-gray-600"><span class="sr-only">Github</span><svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path></svg></a>`;

	let atomEmail = (typeof(rUser.social?.email) === 'string') ? `<email>${rUser.social.email}</email>` : "";
	let rssFeed = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${rUser.title}</title><link>${link}</link><description>${rUser.description}</description><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><language>${rUser.language}</language><image><title>${rUser.author}</title><url>${avatar}</url><link>${link}</link></image><atom:link rel="self" href="${link}/feed.rss" type="application/rss+xml"/><copyright>${new Date().getFullYear()} ${rUser.author}, All rights reserved.</copyright><category>${rUser.category}</category>`;
	let atomFeed = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${link}</id><title>${rUser.title}</title><updated>${new Date().toISOString()}</updated><author><name>${rUser.author}</name>${atomEmail}<uri>${link}</uri></author><link rel="alternate" href="${link}"/><link rel="self" href="${link}/feed.atom"/><subtitle>${rUser.description}</subtitle><logo>${avatar}</logo><icon>${avatar}</icon><rights>${new Date().getFullYear()} ${rUser.author}, All rights reserved.</rights><category term="${rUser.category}"/>`;
	let jsonFeed = {
		"version": "https://jsonfeed.org/version/1.1",
    "title": rUser.title,
    "home_page_url": link,
    "feed_url": `${link}/feed.json`,
		"description": rUser.description,
		"icon": avatar,
		"favicon": avatar,
		"language": rUser.language,
		"authors": [{
			"name": rUser.author,
			"url": link,
			"avatar": avatar
		}],
		"items": []
	};

	let userTemplate = templateUser;
	userTemplate = userTemplate.replaceAll("::metatitle::", rUser.title);
	userTemplate = userTemplate.replaceAll("::metaDescription::", rUser.description);
	userTemplate = userTemplate.replaceAll("::title::", rUser.title);
	userTemplate = userTemplate.replaceAll("::description::", rUser.description);
	userTemplate = userTemplate.replaceAll("::siteName::", env.TITLE);
	userTemplate = userTemplate.replaceAll("::icon::", env.CDN + "/avatars/" + rUser.username);
	userTemplate = userTemplate.replaceAll("::username::", rUser.username);
	userTemplate = userTemplate.replaceAll("::author::", rUser.author);
	userTemplate = userTemplate.replaceAll("::authorURL::", "/creator/" + rUser.username);
	userTemplate = userTemplate.replaceAll("::language::", rUser.language);
	userTemplate = userTemplate.replaceAll("::metaRSS::", env.DOMAIN + "/creator/" + rUser.username + "/feed.rss");
	userTemplate = userTemplate.replaceAll("::metaAtom::", env.DOMAIN + "/creator/" + rUser.username + "/feed.atom");
	userTemplate = userTemplate.replaceAll("::metaJson::", env.DOMAIN + "/creator/" + rUser.username + "/feed.json");
	userTemplate = userTemplate.replaceAll("::metaURL::", env.DOMAIN + "/creator/" + rUser.username);
	userTemplate = userTemplate.replaceAll("::analytics::", env.ANALYTICS);
	userTemplate = userTemplate.replaceAll("::metaDomain::", env.DOMAIN.replace("https://", ""));
	userTemplate = userTemplate.replaceAll("::metaTwitterSite::", env.TWITTER.replace("https://twitter.com/", "@"));
	userTemplate = userTemplate.replaceAll("::social::", social);

	let twitterCreator = (typeof(rUser.social?.twitter) === 'string') ? rUser.social.twitter : env.TWITTER;
	userTemplate = userTemplate.replaceAll("::metaTwitterCreator::", twitterCreator.replace("https://twitter.com/", "@"));

	let userJsondl = [];

	let limit = 9;
	let userHtml = "";
	let posts = {};
	for(let i = 0; i < rPost.length; i++){
		let id = rPost[i].id;
		let username = rPost[i].username;
		let title = rPost[i].title;
		let description = rPost[i].description;
		let picture = (rPost[i].picture.startsWith('http')) ? rPost[i].picture : env.CDN + "/images/" + username + "/" + rPost[i].picture;
		let markdown = rPost[i].markdown;
		let category = rPost[i].category;
		let language = rPost[i].language;
		let tag = rPost[i].tag;
		let keywords = rPost[i].keywords;
		let created = rPost[i].created;
		let read_time = rPost[i].read_time;

		let avatar = env.CDN + "/avatars/" + username;
		let fullPostURL = env.DOMAIN + "/creator/" + username + "/" + id;
		let fullAuthorURL = env.DOMAIN + "/creator/" + username;
		let postLocation = "/creator/" + username + "/" + id;

		posts[id] = {};
		posts[id].title = title;
		posts[id].description = description;
		posts[id].picture = picture;
		posts[id].tag = tag;
		posts[id].keywords = keywords.split(',');
		posts[id].date = created;
		posts[id].read = read_time;

		if(i < limit){
			userHtml += `<div class="flex flex-col overflow-hidden rounded-lg shadow-lg"><div class="flex-shrink-0"><img class="h-48 w-full object-cover" src="${picture}" alt="${title}"></div><div class="flex flex-1 flex-col justify-between bg-white p-6"><div class="flex-1"><p class="text-sm font-medium text-indigo-600"><a href="/creator/${username}?tag=${tag.replaceAll(" ", "_")}" class="hover:underline">${tag}</a></p><a href="${postLocation}" class="mt-2 block"><p class="text-xl font-semibold text-gray-900">${title}</p><p class="mt-3 text-base text-gray-500">${description}</p></a></div><div class="mt-6 flex items-center"><div class="flex-shrink-0"><a href="/creator/${username}"><span class="sr-only">${rUser.author}</span><img class="h-10 w-10 rounded-full" src="${avatar}" alt="${rUser.author}"></a></div><div class="ml-3"><p class="text-sm font-medium text-gray-900"><a href="/creator/${username}" class="hover:underline">${rUser.author}</a></p><div class="flex space-x-1 text-sm text-gray-500"><time datetime="${created}">${new Date(created).toISOString().split('T')[0]}</time><span aria-hidden="true">&middot;</span><span>${read_time} min read</span></div></div></div></div></div>`;
		}

		let wordCount = getWordCount(markdown);
		let rssEmail = (typeof(rUser.social?.email) === 'string') ? `<author>${rUser.email} (${rUser.author})</author>` : "";
		rssFeed += `<item><title><![CDATA[${title}]]></title><link>${fullPostURL}</link><guid>${fullPostURL}</guid><pubDate>${new Date(created).toUTCString()}</pubDate><description><![CDATA[${description}]]></description>${rssEmail}<enclosure url="${picture}" length="0" type="image/svg"/></item>`;
		atomFeed += `<entry><title type="html"><![CDATA[${title}]]></title><id>${fullPostURL}</id><link href="${fullPostURL}"/><updated>${new Date(created).toISOString()}</updated><summary type="html"><![CDATA[${description}]]></summary><author><name>${rUser.author}</name>${atomEmail}<uri>${link}</uri></author></entry>`;
		jsonFeed.items.push({
			"id": fullPostURL,
			"url": fullPostURL,
			"title": title,
			"summary": description,
			"image": picture,
			"banner_image": picture,
			"date_published": new Date(created).toISOString(),
			"date_modified": new Date().toISOString(),
			"tags": keywords.split(','),
			"language": language,
			"authors": [{
				"name": rUser.author,
				"url": link,
				"avatar": avatar
			}]
		});

		let twitter = rUser.social?.twitter || env.TWITTER;
		let website = rUser.social?.website || fullAuthorURL;

		let tempTemplate = templatePost;
		tempTemplate = tempTemplate.replaceAll("::metatitle::", title);
		tempTemplate = tempTemplate.replaceAll("::metaDescription::", description);
		tempTemplate = tempTemplate.replaceAll("::language::", language);
		tempTemplate = tempTemplate.replaceAll("::metaAuthor::", rUser.author);
		tempTemplate = tempTemplate.replaceAll("::metaTag::", tag);
		tempTemplate = tempTemplate.replaceAll("::metaCategory::", category);
		tempTemplate = tempTemplate.replaceAll("::metaPublishedTime::", new Date(created).toISOString());
		tempTemplate = tempTemplate.replaceAll("::metaModifiedTime::", new Date().toISOString());
		tempTemplate = tempTemplate.replaceAll("::metaImage::", picture);
		tempTemplate = tempTemplate.replaceAll("::title::", rUser.title);
		tempTemplate = tempTemplate.replaceAll("::description::", rUser.description);
		tempTemplate = tempTemplate.replaceAll("::siteName::", env.TITLE);
		tempTemplate = tempTemplate.replaceAll("::icon::", env.CDN + "/avatars/" + username);
		tempTemplate = tempTemplate.replaceAll("::username::", username);
		tempTemplate = tempTemplate.replaceAll("::previousLocation::", "/creator/" + username);
		tempTemplate = tempTemplate.replaceAll("::metaDomain::", env.DOMAIN.replace("https://", ""));
		tempTemplate = tempTemplate.replaceAll("::metaRSS::", fullAuthorURL + "/feed.rss");
		tempTemplate = tempTemplate.replaceAll("::metaAtom::", fullAuthorURL + "/feed.atom");
		tempTemplate = tempTemplate.replaceAll("::metaJson::", fullAuthorURL + "/feed.json");
		tempTemplate = tempTemplate.replaceAll("::metaTwitterSite::", env.TWITTER.replace("https://twitter.com/", "@"));
		tempTemplate = tempTemplate.replaceAll("::metaTwitterCreator::", twitter.replace("https://twitter.com/", "@"));
		tempTemplate = tempTemplate.replaceAll("::metaURL::", fullPostURL);
		tempTemplate = tempTemplate.replaceAll("::shareTwitter::", title + "%0A%0A" + fullPostURL);
		tempTemplate = tempTemplate.replaceAll("::analytics::", env.ANALYTICS);
		tempTemplate = tempTemplate.replaceAll("::metaKeywords::", keywords);
		tempTemplate = tempTemplate.replaceAll("::social::", social);

		let html = `<h1 class="post-title">${title}</h1>`;
		html += `<div class="flex space-x-1 f16"><time datetime="${created}">${new Date(created).toISOString().split('T')[0]}</time><span aria-hidden="true">&middot;</span><span>${read_time} min read</span></div>`;
		html += `<div class="mt-6 flex items-center"><div class="flex-shrink-0"><a href="/creator/${username}"><span class="sr-only">${rUser.author}</span><img class="h-12 w-12 rounded-full" src="${avatar}" alt="${rUser.author}"></a></div><div class="ml-3"><p class="f16 font-medium"><a href="/creator/${username}">${rUser.author}</a></p></div></div>`;

		let postHtml = marked.parse(markdown, {
			gfm: true,
			breaks: true,
			sanitizer: DOMPurify.sanitize
		});

		html += postHtml;
		tempTemplate = tempTemplate.replaceAll("::post::", html);

		const jsondl = {
			"@context": "http://schema.org",
			"@type": "BlogPosting",
			"headline": title,
			"description": description,
			"url": fullPostURL,
			"genre": category,
			"articleSection": category,
			"wordcount": wordCount,
			"keywords": keywords.split(','),
			"image": [
				picture,
				avatar
			],
			"datePublished": created,
			"dateModified": new Date().toISOString(),
			"articleBody": postHtml,
			"publisher": {
				"@type": "Organization",
				"name": rUser.title,
				"url": fullAuthorURL
			},
			"author": {
				"@type": "Person",
				"name": rUser.author,
				"url": website
			},
		}
		userJsondl.push(jsondl);
		tempTemplate = tempTemplate.replaceAll("::jsondl::", JSON.stringify(jsondl));

		await setPageValue(`post_${username}_${id}`, tempTemplate);
	}

	rssFeed += "</channel></rss>";
	atomFeed += "</feed>";

	await setPageValue("feed_rss_" + data.username, rssFeed);
	await setPageValue("feed_atom_"  + data.username, atomFeed);
	await setPageValue("feed_json_"  + data.username, JSON.stringify(jsonFeed));

	// User Main Page
	userTemplate = userTemplate.replaceAll("::post::", userHtml);
	userTemplate = userTemplate.replaceAll("::jsondl::", JSON.stringify(userJsondl));
	await setPageValue("content_" + data.username, userTemplate);

	// Metadata
	let metadata = `var DOMAIN = "${env.DOMAIN}"; var CDN = "${env.CDN}"; var USERNAME = "${data.username}"; var AUTHOR = "${rUser.author}"; var CATEGORY = "${rUser.category}"; var LANGUAGE = "${rUser.language}"; var POSTS = ${JSON.stringify(posts)};`;
	await setPageValue("metadata_" + data.username, metadata);

	return jsonResponse({ "error": 0, "info": "Success" });
});

router.all("*", () => {
	return jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
});

export default {
	async fetch(request, env2){
		env = env2;

		if(request.method.toLowerCase() === "options") {
			return new Response("ok", { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': '*' } });
		}

		date = new Date().toISOString().split('T')[0];
		let IP = request.headers.get('CF-Connecting-IP');
		hashedIP = await generateHash("rabbitcompany" + IP + date, 'SHA-256');
		return router.handle(request);
	},
	async scheduled(controller, env2, ctx) {
		env = env2;
		date = new Date().toISOString().split('T')[0];
		await generateMainPage();
	},
};