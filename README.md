# blog-api-lite
***
# Overview
- **`PORT`** is assumed at **`3000`** 

## Auth Routes
1. `POST` - `http://localhost:3000/api/auth/register`
	- To register the user
	- json PayLoad: -
	```json
	{
		"name": "<string>",
		"email": "<string>",
		"password": "<string>"
	}
	```
	- Response: -
	```json
	{
		"message": "User registered with email <email>"
	}
	```
2. `POST` - `http://localhost:3000/api/auth/login`
	- To login 
	- json PayLoad: -
	```json
	{
		"email": "<string>",
		"password": "<string>"
	}
	```
	- Response: -
	```json
	{
        "message": "Login successful",
    	"token": "<token>"
	}
	```

# Starting the server
```bash
git clone https://github.com/PrathameshGandule/blog-api-lite.git
```
```bash
cd blog-api-lite
npm install
```
- Setup .env configs
```bash
npm run build
```
```bash
npm run start
```