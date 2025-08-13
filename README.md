# Comms Command Center

A lightweight dashboard for managing Telegram and Twitter messages.

## Features

- **Unified Message Dashboard**: View Telegram and Twitter messages in one place
- **Auto-Categorization**: Messages are automatically categorized as Urgent, High Priority, Routine, or Archive
- **Reply Templates**: Pre-written response templates for quick replies
- **Real-time Updates**: Refresh to fetch new messages
- **Clean UI**: Modern dashboard with filtering and search capabilities

## Project Structure

```
pag-command-centre-demo/
├── backend/           # FastAPI server
├── frontend/          # React dashboard
├── docker-compose.yml # Docker setup
└── README.md         # This file
```

## Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository
2. Run the entire stack:
   ```bash
   docker-compose up --build
   ```
3. Open http://localhost:3000 in your browser

### Option 2: Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (create `.env` file):
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open http://localhost:3000 in your browser

## API Keys Setup

### Telegram Bot API
1. Create a bot via @BotFather on Telegram
2. Get your bot token
3. Add to `.env`: `TELEGRAM_BOT_TOKEN=your_token_here`

### Twitter API v2
1. Apply for Twitter Developer access
2. Create an app and get your bearer token
3. Add to `.env`: `TWITTER_BEARER_TOKEN=your_token_here`

## Features

### Message Categories
- **Urgent**: Messages containing keywords like "urgent", "emergency", "help", "broken"
- **High Priority**: Messages from important contacts or containing "important", "priority"
- **Routine**: Regular messages and updates
- **Archive**: Old messages or low-priority content

### Reply Templates
Pre-written templates for common responses:
- "Thanks for reaching out! I'll get back to you soon."
- "This is interesting, let me look into it."
- "I'm currently busy, but I'll address this ASAP."
- "Thanks for the feedback, much appreciated!"

## API Endpoints

- `GET /api/messages` - Get all messages with optional filters
- `POST /api/messages/{id}/category` - Update message category
- `GET /api/templates` - Get reply templates
- `POST /api/refresh` - Fetch new messages from APIs

## Development Notes

- Uses SQLite for local data storage
- Mock data available when API keys are not configured
- Single-user system (no authentication required for MVP)
- Responsive design with Tailwind CSS

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in docker-compose.yml or use different ports for local development
2. **API rate limits**: The app handles rate limiting gracefully with retry logic
3. **Missing API keys**: App will use mock data automatically

### Logs

- Backend logs: Check terminal where uvicorn is running
- Frontend logs: Check browser console
- Docker logs: `docker-compose logs -f`

## Contributing

This is a prototype for demonstration purposes. For production use, consider:
- Adding authentication
- Implementing proper error handling
- Adding message encryption
- Setting up proper logging and monitoring
