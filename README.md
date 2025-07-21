# ReservaSynch 🏨

## 📱 About
ReservaSynch is a modern hotel booking application that integrates with the Belvilla API to provide real-time hotel availability, pricing, and booking functionality. The application features a sleek Airbnb-inspired interface with comprehensive hotel management capabilities.

## 🚀 Technologies Used

### Backend
- **Java Spring Boot** - RESTful API framework
- **Spring Web** - HTTP client for external API integration
- **Jackson** - JSON processing and serialization
- **Maven** - Dependency management

### Frontend
- **React.js** - Component-based UI framework
- **Vite** - Fast build tool and development server
- **Lucide React** - Modern icon library
- **date-fns** - Date manipulation utilities
- **react-date-range** - Advanced calendar component
- **Tailwind CSS** - Utility-first styling framework

### External Integration
- **Belvilla API** - Real-time hotel data, pricing, and availability

### DevOps & Deployment
- **Docker** - Containerization for consistent environments
- **Docker Compose** - Multi-container orchestration

## ✨ Key Features

### 🏨 Hotel Management
- Real-time hotel data fetching from Belvilla API
- Comprehensive hotel information display
- High-quality image galleries with navigation
- Property details (rooms, beds, amenities, area)

### 📅 Advanced Booking System
- Interactive calendar with availability checking
- Smart date selection with validation
- Real-time pricing calculations
- Guest management (adults, children, babies, pets)
- Extra services (towels, pet fees)

### 💰 Pricing Engine
- Dynamic pricing based on dates and guest count
- Real-time price breakdown with extras
- Currency formatting and calculations
- Seasonal and availability-based pricing

### 🎨 Modern UI/UX
- Mobile-optimized calendar interface
- Smooth animations and transitions
- Professional modal dialogs
- Intuitive guest and extras selection
- Premium styling with gradients and glass-morphism effects

### 🔧 Backend API Features
- **Hotel Data**: Complete hotel information retrieval
- **Availability**: Multi-month calendar view with real-time data
- **Pricing**: Dynamic pricing with guest count variations
- **Images**: Gallery management with thumbnails
- **Validation**: Date range and availability checking

## 🐳 Docker Setup & Deployment

### Prerequisites
- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)

### 🚀 Quick Start (Development Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/idriss111/reservasynch.git
   cd ReservaSynch
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8080/

4. **Stop the application**
   ```bash
   # Press Ctrl+C in terminal, then:
   docker-compose down
   ```

### 🏭 Production Deployment

```bash
# Start in production mode
docker-compose -f docker-compose.prod.yml up -d

# Access at:
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

### 🔧 Docker Commands Reference

#### Basic Operations
```bash
# Start services (development)
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check running containers
docker-compose ps
```

#### Development Commands
```bash
# Rebuild and start (after code changes)
docker-compose up --build

#### Cleanup Commands
```bash
# Stop and remove containers + volumes
docker-compose down -v

# Remove project images
docker rmi reservasynch-frontend reservasynch-backend

# Clean all unused Docker resources
docker system prune -a -f --volumes
```

## 🛠️ Traditional Installation & Setup

### Prerequisites
- Java 17 or higher
- Node.js 22.14.0+ and npm
- Maven 3.6+

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Run the Spring Boot application
./mvnw spring-boot:run
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

## 🧪 Testing the Docker Setup

### 1. Test Individual Services
```bash
# Test frontend build
cd frontend
docker build -t test-frontend .

# Test backend build
cd ../backend
docker build -t test-backend .
```

### 2. Test Full Application
```bash
# Start all services
docker-compose up

# Verify services are running
docker-compose ps

# Test endpoints
curl http://localhost:5173        # Frontend
curl http://localhost:8080/api    # Backend API
```

### 3. Test Production Build
```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up --build

# Access production app
open http://localhost:80
```

## 🎯 API Endpoints

### Hotel Information
- `GET /api/hotels/{hotelId}` - Get hotel details
- `GET /api/hotels/{hotelId}/images/urls` - Get hotel images

### Pricing
- `GET /api/hotels/{hotelId}/pricing/dates` - Get pricing for specific dates
- `GET /api/hotels/{hotelId}/pricing` - Get default pricing

### Availability
- `GET /api/hotels/{hotelId}/availability/checkin-dates` - Get available check-in dates
- `GET /api/hotels/{hotelId}/availability/checkout-dates` - Get checkout dates for check-in

## 🔍 Troubleshooting

### Docker Issues

**Port Already in Use**
```bash
# Check what's using the ports
netstat -tulpn | grep :5173
netstat -tulpn | grep :8080

# Kill process using port (replace PID)
kill -9 <PID>
```

**Docker Desktop Not Running**
```bash
# Start Docker Desktop application
# Wait for Docker whale icon in system tray
# Test with:
docker --version
```

**Build Failures**
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Services Won't Start**
```bash
# Check logs for errors
docker-compose logs

# Restart Docker Desktop
# Try again with:
docker-compose up --build
```

### Performance Tips
- Use `docker-compose up -d` to run in background
- Use `--build` flag when you change code
- Clean unused resources regularly with `docker system prune`
- Monitor container resource usage with `docker stats`

## 📦 Project Architecture

```
ReservaSynch/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── assets/            # Static assets
│   │   └── ...
│   ├── Dockerfile             # Frontend container config
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
├── backend/                     # Spring Boot application
│   ├── src/main/java/         # Java source code
│   ├── src/main/resources/    # Configuration files
│   ├── Dockerfile             # Backend container config
│   ├── pom.xml               # Maven dependencies
│   └── mvnw                  # Maven wrapper
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── README.md                   # This file
```

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Performance**: Optimized API calls and efficient state management
- **User Experience**: Intuitive booking flow with real-time feedback
- **Modern Styling**: Premium gradients, animations, and micro-interactions

## 🔧 Technical Highlights

- **Containerization**: Full Docker support with development and production configurations
- **API Integration**: Robust external API handling with error management
- **Date Management**: Complex availability logic with validation
- **State Management**: Efficient React hooks and state synchronization
- **Responsive Calendar**: Custom calendar implementation with mobile optimization
- **Price Calculations**: Real-time pricing with extras and breakdown
- **Multi-stage Builds**: Optimized Docker images for production

## 🎯 For Professors/Reviewers

### Simple Demo Setup
```bash
# 1. Ensure Docker Desktop is running
docker --version

# 2. Start the application
cd ReservaSynch
docker-compose up

# 3. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:8080

# 4. Stop when done
docker-compose down
```

### What You'll See
- **Modern React interface** with premium calendar styling
- **Real-time date selection** and availability checking
- **Dynamic pricing calculations** with extras
- **Responsive design** optimized for all devices
- **Professional Spring Boot API** with JSON responses

### Key Features to Test
1. **Hotel Information Display** - Modern card-based layout
2. **Calendar Functionality** - Custom Airbnb-style date picker
3. **Guest Selection** - Adults, children, babies with limits
4. **Extras System** - Towels and pet fees with calculations
5. **Price Updates** - Real-time total price calculations
6. **Mobile Responsiveness** - Test on different screen sizes

## 🎯 Future Improvements

- User authentication and profiles
- Booking confirmation and payment integration
- Email notifications and confirmations
- Admin dashboard for hotel management
- Multi-language support
- Advanced search and filtering
- Reviews and rating system
- Kubernetes deployment configurations
- CI/CD pipeline integration

---

**Built with ❤️ using Docker, Spring Boot, React, and modern web technologies**
