#User Authentication and Profile Management API
This API provides routes for user registration, login, profile update, password reset, palindrome check, and unique-duplicates functionality. It also includes image upload functionality using Multer for profile images.

#Technologies Used
Node.js
Express.js
MySQL
Sequelize ORM
JWT (JSON Web Tokens) for authentication
Bcrypt.js for password hashing
Nodemailer for email functionality
Multer for file uploads
dotenv for environment variable management

#Setup

1. Clone the Repository
Clone this repository to your local machine.
git clone https://github.com/ayush7078/test-backend.git

2. Install Dependencies
Install the required dependencies using npm:
npm install

3. Set Up Environment Variables
Create a .env file in the root directory and add the following environment variables:

MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=assignment
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

4. Start the Server
Start the server by running the following command:
npm start
The server will run on http://localhost:5000.

#API Endpoints
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
Response: Returns a success message if the password is updated.

5. PUT /api/users/update-profile
Updates user profile information.

Fields: email, name, profile
Response: Returns a success message with updated details.

6. POST /api/users/palindrome
Checks if a string is a palindrome.

Fields: str
Response: Returns true or false based on whether the string is a palindrome.

7. POST /api/users/unique-count-duplicates
Returns unique values in an array and the count of duplicate values.

Fields: array
Response: Returns uniqueValues (an array of unique values) and duplicateCount (the number of duplicates).

#Database Setup
Ensure you have MySQL installed and configured on your system. Create a MySQL database and configure the .env file with your MySQL credentials.

Database: MySQL
Schema Setup: Sequelize will automatically create the tables if they do not exist based on the models defined.