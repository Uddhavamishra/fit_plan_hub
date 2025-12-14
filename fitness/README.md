FitPlanHub - Trainers & Users Fitness Platform

A fullstack proram build to manage 

User Features
User authentication (signup/login)
Browse all available fitness plans
Subscribe to plans (simulated payment)
Follow/unfollow trainers
Personalized feed with plans from followed trainers
Access control (preview vs full access)

Trainer Features
Trainer authentication 
Create, edit, and delete fitness plans
Dashboard with stats 
View followers list

Tech Stack

Frontend:React.js, React Router, Axios
Backend:Node.js, Express.js
Database:MongoDB (local)
Authentication:JWT (JSON Web Tokens)
Password Hashing:bcryptjs


Prerequisites
Node.js(v14 or higher)
MongoDB installed and running locally
npm or yarn

Installation

Clone to the project folder:
   ```bash
   cd fitness
   ```
Install backend dependencies:
   ```bash
   npm install
   ```

Install frontend 
   ```bash
   cd client
   npm install
   cd ..
   ```


Start MongoDB (make sure it's running on port 27017):
   ```bash
   mongod
   ```

Run the application:

   Option 1 - Run both
   ```bash
   npm run dev
   ```

   Option 2 - Run separately
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```
Open your browser:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
