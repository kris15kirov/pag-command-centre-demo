# PAG Command Centre Demo

A comprehensive social media monitoring and management platform designed specifically for **Pashov Audit Group** (PAG), helping busy Web3 founders like Krum manage Telegram and Twitter communications efficiently.

## 🚀 Features

### Core Functionality
- **Message Aggregation**: Collects messages from Telegram and Twitter in one dashboard
- **Smart Categorization**: Auto-categorizes messages as urgent, high, routine, or archive
- **Web3-Focused**: Prioritizes messages mentioning audited projects (Uniswap, Aave, LayerZero, Ethena, Sushi)
- **Reply Templates**: Pre-built templates for quick responses
- **Real-time Updates**: Manual refresh to fetch latest messages

### Web3-Specific Enhancements
- **Dark Theme UI**: Professional Web3 aesthetic with neon accents
- **Project Badges**: Visual indicators for audited project mentions
- **Blockchain Animations**: Subtle animations and hover effects
- **Responsive Design**: Works on desktop and mobile devices
- **Professional Typography**: Inter font family for modern look

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLite**: Lightweight database for message storage
- **Pytest**: Comprehensive testing framework
- **Python 3.9+**: Core runtime

### Frontend
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Professional icon library
- **Jest + Testing Library**: Frontend testing
- **Axios**: HTTP client for API communication

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **Git**: Version control

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- Docker (optional)
- Git

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pag-command-centre-demo

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Option 2: Local Development

```bash
# Clone the repository
git clone <repository-url>
cd pag-command-centre-demo

# Start the application
./start.sh

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## 🧪 Testing

### Comprehensive Test Suite

The project includes a complete testing strategy as recommended by modern development practices:

#### Backend Tests (FastAPI + SQLite)
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

**Test Coverage:**
- ✅ API Endpoints (`/messages`, `/refresh`, `/messages/{id}/category`)
- ✅ Database Operations (CRUD operations)
- ✅ Message Categorization Logic
- ✅ Web3-Specific Features (audited project detection)
- ✅ Error Handling and Edge Cases

#### Frontend Tests (React + Jest)
```bash
cd frontend
npm test
```

**Test Coverage:**
- ✅ Component Rendering
- ✅ User Interactions (filters, category updates)
- ✅ API Integration
- ✅ Web3 UI Elements (project badges, animations)
- ✅ Responsive Design
- ✅ Error Handling

#### Integration Tests
```bash
# Run all tests including integration
./run_tests.sh
```

**Integration Coverage:**
- ✅ End-to-End API Testing
- ✅ Database Integration
- ✅ Frontend-Backend Communication
- ✅ Real-world Scenarios

### Test Structure

```
├── backend/
│   └── tests/
│       └── test_api.py          # Comprehensive API tests
├── frontend/
│   └── src/
│       └── App.test.jsx         # React component tests
└── run_tests.sh                 # Test runner script
```

### Running Specific Tests

```bash
# Backend tests only
cd backend && pytest tests/test_api.py::TestMessagesEndpoint -v

# Frontend tests only
cd frontend && npm test -- --testNamePattern="Dashboard"

# Integration tests
./run_tests.sh
```

## 🎨 Web3 UI Features

### Dark Theme Design
- **Background**: Deep blue gradient (`#1a1a2e` to `#16213e`)
- **Accent Colors**: Purple (`#6b46c1`), Blue (`#38bdf8`), Green (`#10b981`)
- **Typography**: Inter font family for professional appearance

### Interactive Elements
- **Gradient Buttons**: Smooth color transitions on hover
- **Glow Effects**: Subtle animations for important elements
- **Project Badges**: Animated badges for audited project mentions
- **Custom Scrollbars**: Themed scrollbars matching the design

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets for mobile devices
- **Flexible Layout**: Adapts to different viewport sizes

## 🔧 Configuration

### Environment Variables

Create `.env` file in the backend directory:

```env
# API Configuration
USE_MOCK_DATA=True
DATABASE_URL=sqlite:///comms.db

# Telegram API (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Twitter API (optional)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_USER_ID=your_user_id
```

### Mock Data

The application includes realistic mock data for demonstration:

```python
# Sample messages included in tests
- "Urgent audit for Uniswap fork"
- "@KrumPashov Aave integration query"
- "Need Sofamon NFT audit"
- "@KrumPashov LayerZero bridge audit?"
```

## 📊 API Endpoints

### GET /messages
Retrieve all messages from the database.

**Response:**
```json
[
  {
    "id": "1",
    "source": "Telegram",
    "sender": "@Web3Dev",
    "text": "Urgent audit for Uniswap fork",
    "category": "urgent",
    "timestamp": "2025-08-12T10:00:00Z"
  }
]
```

### GET /refresh
Fetch new messages from Telegram and Twitter APIs.

**Response:**
```json
{
  "success": true
}
```

### POST /messages/{id}/category
Update message category.

**Request:**
```json
{
  "category": "high"
}
```

**Response:**
```json
{
  "success": true
}
```

## 🏗 Project Structure

```
pag-command-centre-demo/
├── backend/
│   ├── config/                 # Configuration management
│   ├── services/              # Business logic services
│   ├── tests/                 # Backend test suite
│   ├── main.py               # FastAPI application
│   ├── models.py             # Database models
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   └── App.js           # Main application
│   ├── public/              # Static assets
│   └── package.json         # Node.js dependencies
├── docker-compose.yml       # Docker orchestration
├── start.sh                # Application startup script
├── run_tests.sh            # Test runner script
└── README.md               # Project documentation
```

## 🚀 Deployment

### Production Deployment

```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms
# - Heroku
# - AWS ECS
# - Google Cloud Run
# - DigitalOcean App Platform
```

### Environment Setup

```bash
# Production environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@host:port/db
export TELEGRAM_BOT_TOKEN=your_production_token
export TWITTER_BEARER_TOKEN=your_production_token
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- **Test Coverage**: Maintain >80% test coverage
- **Code Style**: Follow PEP 8 (Python) and ESLint (JavaScript)
- **Documentation**: Update README for new features
- **Web3 Focus**: Keep Web3 context in mind for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Grok AI**: For comprehensive testing recommendations and Web3 UI insights
- **Uniswap & Aave**: For inspiration in Web3 UI design patterns
- **FastAPI & React**: For excellent developer experience
- **Tailwind CSS**: For utility-first styling approach

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the Web3 community**
