# 💕 Matrimony Application with Admin Panel

A full-stack matrimony application built with React, Spring Boot, and .NET Core.

## 🏗️ Architecture

- **Frontend**: React.js with Redux
- **Backend**: Spring Boot (Java)
- **Subscription Service**: ASP.NET Core (.NET 9.0)
- **Database**: MySQL
- **Authentication**: JWT

## 🚀 Features

### User Features
- User registration and authentication
- Profile management with photo uploads
- Match finding based on preferences
- Real-time messaging system
- Subscription management
- Connection requests

### Admin Features
- User management
- Profile approval system
- Dashboard analytics
- Content moderation

## 📁 Project Structure

```
matrimony-with-admin-panel/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # State management
│   │   └── services/      # API services
│   └── package.json
├── server/
│   ├── Matrimony-Backend/ # Spring Boot API
│   │   ├── src/main/java/
│   │   └── pom.xml
│   ├── matrimony_subscription/ # .NET Subscription Service
│   │   └── matrimony_subscription/
│   └── Sql-Tables/        # Database schema
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- Java (v11+)
- .NET SDK (v9.0+)
- MySQL (v8.0+)

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Spring Boot Backend Setup
```bash
cd server/Matrimony-Backend
mvn clean install
mvn spring-boot:run
```

### .NET Subscription Service Setup
```bash
cd server/matrimony_subscription/matrimony_subscription
dotnet restore
dotnet run
```

### Database Setup
1. Create MySQL database named `railway`
2. Run the SQL script from `server/Sql-Tables/Complete_Schema.sql`

## 🔧 Configuration

### Database Connection
Update connection strings in:
- `server/Matrimony-Backend/src/main/resources/application.properties`
- `server/matrimony_subscription/matrimony_subscription/appsettings.json`

### API Endpoints
- Frontend: `http://localhost:3000`
- Spring Boot: `http://localhost:8080`
- .NET Service: `http://localhost:5280`

## 📱 Usage

1. **Register** a new account
2. **Complete** your profile
3. **Set preferences** for matches
4. **Browse matches** and send connection requests
5. **Chat** with connected users
6. **Manage subscription** for premium features

## 👨‍💼 Admin Panel

Access admin features at `/admin` with admin credentials:
- User management
- Profile approvals
- System analytics

## 🛡️ Security Features

- JWT-based authentication
- Password encryption
- CORS configuration
- Input validation
- SQL injection protection

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.
