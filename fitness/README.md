# 🏋️ FitPlanHub - Trainers & Users Fitness Platform

A full-stack fitness platform where certified trainers create fitness plans and users can purchase & follow these plans.

## 🌟 Features

### User Features
- 🔐 User authentication (signup/login)
- 📋 Browse all available fitness plans
- 💳 Subscribe to plans (simulated payment)
- 👥 Follow/unfollow trainers
- 📰 Personalized feed with plans from followed trainers
- 🔒 Access control (preview vs full access)

### Trainer Features
- 🔐 Trainer authentication (signup/login)
- ✏️ Create, edit, and delete fitness plans
- 📊 Dashboard with stats (plans, followers)
- 👥 View followers list

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (local)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## 📁 Project Structure

```
fitness/
├── client/                 # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # Reusable components
│       │   ├── Navbar.js
│       │   ├── PlanCard.js
│       │   ├── PlanModal.js
│       │   └── TrainerCard.js
│       ├── context/        # React Context
│       │   └── AuthContext.js
│       ├── pages/          # Page components
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── TrainerDashboard.js
│       │   ├── PlanDetails.js
│       │   ├── UserFeed.js
│       │   ├── MyPlans.js
│       │   ├── Trainers.js
│       │   └── TrainerProfile.js
│       ├── utils/
│       │   └── api.js      # Axios instance
│       ├── App.js
│       ├── index.js
│       └── index.css
├── server/                 # Node.js Backend
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   ├── FitnessPlan.js
│   │   ├── Subscription.js
│   │   └── Follow.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── follows.js
│   │   ├── feed.js
│   │   └── trainers.js
│   └── index.js           # Server entry point
├── .env                   # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** installed and running locally
- **npm** or **yarn**

### Installation

1. **Clone or navigate to the project folder:**
   ```bash
   cd fitness
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the shortcut:
   ```bash
   npm run install-all
   ```

4. **Start MongoDB** (make sure it's running on port 27017):
   ```bash
   mongod
   ```

5. **Run the application:**

   **Option 1 - Run both together:**
   ```bash
   npm run dev
   ```

   **Option 2 - Run separately:**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user/trainer |
| POST | `/api/auth/login` | Login user/trainer |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Fitness Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | Get all plans (with filters) |
| GET | `/api/plans/:id` | Get single plan |
| POST | `/api/plans` | Create plan (trainer only) |
| PUT | `/api/plans/:id` | Update plan (owner only) |
| DELETE | `/api/plans/:id` | Delete plan (owner only) |
| GET | `/api/plans/trainer/myplans` | Get trainer's plans |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/:planId` | Subscribe to plan |
| GET | `/api/subscriptions` | Get user's subscriptions |
| GET | `/api/subscriptions/check/:planId` | Check subscription status |
| DELETE | `/api/subscriptions/:id` | Cancel subscription |

### Follow System
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/follows/:trainerId` | Follow a trainer |
| DELETE | `/api/follows/:trainerId` | Unfollow a trainer |
| GET | `/api/follows/following` | Get followed trainers |
| GET | `/api/follows/check/:trainerId` | Check follow status |
| GET | `/api/follows/followers` | Get followers (trainer) |

### Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get personalized feed |
| GET | `/api/feed/purchased` | Get purchased plans |

### Trainers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trainers` | Get all trainers |
| GET | `/api/trainers/:id` | Get trainer profile |

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'trainer',
  bio: String,
  specialization: String,
  createdAt: Date
}
```

### FitnessPlan Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  duration: Number (days),
  category: String,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  workoutDetails: String,
  trainer: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date
}
```

### Subscription Model
```javascript
{
  user: ObjectId (ref: User),
  plan: ObjectId (ref: FitnessPlan),
  purchaseDate: Date,
  expiryDate: Date,
  amountPaid: Number,
  paymentStatus: String,
  isActive: Boolean
}
```

### Follow Model
```javascript
{
  follower: ObjectId (ref: User),
  trainer: ObjectId (ref: User),
  followedAt: Date
}
```

## 🔐 Access Control

- **Non-subscribers** see only:
  - Plan title
  - Trainer name
  - Price
  - Truncated description (preview)

- **Subscribers** get full access to:
  - Complete description
  - Workout details
  - All plan content

## 🎨 Screens

1. **Landing Page** - Browse all plans with filters
2. **Login/Signup** - Authentication with role selection
3. **Trainer Dashboard** - CRUD operations on plans, view followers
4. **Plan Details** - Full or preview view based on subscription
5. **User Feed** - Personalized plans from followed trainers
6. **My Plans** - User's purchased/subscribed plans
7. **Trainers List** - Browse and follow trainers
8. **Trainer Profile** - Trainer info with their plans

## 🧪 Testing with Postman

Import the Postman collection from `postman/FitPlanHub.postman_collection.json`

### Test Flow:
1. Create a trainer account
2. Login as trainer → get token
3. Create fitness plans
4. Create a user account
5. Login as user → get token
6. Browse plans
7. Follow trainer
8. Subscribe to a plan
9. View personalized feed

## 📝 Environment Variables

```env
MONGO_URI=mongodb://127.0.0.1:27017/fitplanhub
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

---

Made with ❤️ for fitness enthusiasts
