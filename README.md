# blog-api-lite
***
# Overview
- **`PORT`** is assumed at **`3000`** 
- [Auth Routes](#auth-routes)
	- Register 
	- Login


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

## User Routes
- **It's expected to send Authorization token with every request with preceeding _`Bearer `_**
- Example : - `Bearer eyBglsjIk_hbskd52D3de2415QCD.51d51`
1. `POST` - `http://localhost:3000/api/user/blog/add`
	- To add blog
	- json PayLoad: -
	```json
	{
		"title": "<string>",
		"content": "<string>"
	}
	```
	- Response
	```json
	{
		"message": "Your blog is uploaded"
	}
	```
2. `DELETE` - `http://localhost:3000/api/user/blog/delete/:id`
	- To delete a specific blog
	- No json payload here
	- Response
	```json
	{
		"message": "Your blog is deleted"
	}
	```
3. `PUT` - `http://localhost:3000/api/user/blog/update/:id`
	- To update a specific blog
	- Atleast one field to be given in json payload
	- json PayLoad: -
	```json
	{
		"title": "<string>",
		"content": "<string>"
	}
	```
	- Response: -
	```json
	{
		"message": "Blog updated successfully",
		"blog": "<whole updated blog>"
	}
	```
4. `GET` - `http://localhost:3000/api/user/blogs`
	- To get all blogs posted by the user
	- No json payload here
	- Response: -
	```json
	{
		"<list of all blogs>"
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