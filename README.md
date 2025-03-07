# blog-api-lite

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
***
# Overview
- **`PORT`** is assumed at **`3000`** 
- [Auth Routes](#auth-routes)
	- Register 
	- Login
    - Send OTP
    - Verify OTP
- [User Routes](#user-routes)
	- Add Blog
	- Delete Blog
	- Update Blog
	- Get all blogs by user
- [Public Routes](#general-public-routes)
	- Get a blog by Id
	- Get all Blogs

## Auth Routes
1. `POST` - `/api/auth/register`
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
2. `POST` - `/api/auth/login`
	- To login 
	- json PayLoad: -
	```json
	{
		"email": "<valid email-id>",
		"password": "<string>"
	}
	```
	- Response: -
	```json
	{
        "message": "Login successful"
	}
    // and a token in cookies
	```
3. `POST` - `/api/auth/send-otp`
    - To send otp
    - json PayLoad :-
    ```json
    {
        "email": "<valid email-id>"
    }
    ```
    - Response :- 
    ```json
    {
        "message": "Otp sent successfully"
    }
    ```
4. `POST` - `/api/auth/verify-otp`
    - To verify otp
    - json PayLoad :- 
    ```json
    {
        "email": "<valid email-id>",
        "otp": "<your otp>"
    }
    ```
    - Response :- 
    ```json
    {
        "message": "OTP verified successfully! You can register now between 2 minutes."
    }
    ```
***
## User Routes
1. `POST` - `/api/user/blog/add`
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
2. `DELETE` - `/api/user/blog/delete/:id`
	- To delete a specific blog
	- Id to be provided in params
	- No json payload here
	- Response
	```json
	{
		"message": "Your blog is deleted"
	}
	```
3. `PUT` - `/api/user/blog/update/:id`
	- To update a specific blog
	- Id to be provided in params
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
4. `GET` - `/api/user/blogs`
	- To get all blogs posted by the user
	- No json payload here
	- Response: -
	```json
	{
		"<list of all blogs>"
	}
	```
***
## General public routes
1. `GET` - `/api/public/blog/:id`
	- To get a blog by it's Id
	- Id to be provided in params
	- Response: -
	```json
	{
		"_id": "<ObjectId>",
		"author": "<ObjectId>",
		"title": "<string>",
		"content": "<string>",
		"createdAt": "<ISO-Date>",
		"updatedAt": "<ISO-Date>",
		"__v": "<number>"
	}
	```
2. `GET` - `/api/public/blogs`
	- To get all blogs in the database
	- Response: -
	```json
	[
		{"<blog 1>"},
		{"<blog 2>"},
		...
	]
	```
***