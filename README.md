# User Authentication and Profile Management API
This API provides routes for user registration, login, profile update, password reset, palindrome, and  unique-duplicates functionality. It also includes image upload functionality using Multer for profile images.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens) for authentication
- Bcrypt.js for password hashing
- Nodemailer for email functionality
- Multer for file uploads
- dotenv for environment variable management

## Setup

### 1. Clone the Repository
Clone this repository to your local machine.

git clone https://github.com/your-username/your-repo.git

2. Install Dependencies
Install the required dependencies using npm:
npm install

3. Set Up Environment Variables
Create a .env file in the root directory and add the following environment variables:
MONGODB_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS

4. Start the Server
Start the server by running the following command:
npm start
The server will run on http://localhost:5000.

API Endpoints
1. POST /api/users/register
Registers a new user.

Fields: name, email, password, profile
Response: Returns a JWT token on successful registration.

2. POST /api/users/login
Logs in a user.

Fields: email, password
Response: Returns a JWT token on successful login.

3. POST /api/users/forgot-password
Sends a password reset email.

Fields: email
Response: Sends a password reset link to the provided email.

4. POST /api/users/reset-password/:token
Resets the user password using a token from the password reset email.

Fields: password
Response: Returns a success message if password is updated.

5. PUT /api/users/update-profile
Updates user profile information.

Fields: email, name, profile
Response: Returns a success message with updated details.

6. POST /api/users/palindrome
Return true or false by checking the string is palindrome or not.

Fields: str
Response: Returns a success message true or false.

7. POST /api/users/unique-Countduplicates
Return the unique Values which is present in array and Count of duplicate Values.
 
Fields: array
Response: Returns the response uniqueValues and duplicateCount.
