# 🚀 Web3 Command Center - Pashov Audit Group

A modern, real-time communication dashboard for Web3 security teams, designed specifically for Pashov Audit Group to manage Telegram and Twitter notifications, project feeds, and audit requests with advanced template management.

## ✨ Features

### 🎯 **Smart Message Filtering**
- **Category Filters**: Urgent (🚨), High Priority (⚠️), Routine (📋), Archive (📁)
- **Source Filters**: Telegram (📱), Twitter (🐦), All Messages (📊)
- **Project Filters**: Uniswap, Aave, LayerZero, Ethena, Sushi, Arbitrum, Blueberry
- **Real-time Counts**: Dynamic message counts for each filter
- **Clear Filters**: One-click filter reset functionality
- **Filter Status Bar**: Shows active filters and total message counts

### 📱 **Multi-Source Integration**
- **Telegram Integration**: Real-time Telegram notifications with urgent alerts
- **Twitter Feed**: Automated Twitter monitoring for project updates
- **Unified Dashboard**: All communications in one place
- **Separate Sections**: Clear distinction between Telegram and Twitter messages

### 🎨 **Modern Web3 Design**
- **Dark Theme**: Professional dark mode with neon accents
- **Gradient Effects**: Beautiful purple-to-blue gradients throughout
- **Hover Animations**: Smooth transitions and micro-interactions
- **Responsive Layout**: Works on desktop and mobile devices
- **Web3 Aesthetics**: Futuristic design with glowing elements
- **Performance Optimized**: GPU acceleration and reduced transitions

### 🔧 **Advanced Template Management**
- **Drag-and-Drop Reordering**: Intuitive template reordering with visual feedback
- **Template Deletion**: Safe deletion with confirmation dialogs
- **Custom Template Creation**: Add new templates via modal interface
- **Template Copying**: One-click copy to clipboard functionality
- **Persistent Storage**: Templates saved to localStorage
- **10+ Pre-built Templates**: Web3-specific audit response templates

### 📊 **Enhanced Functionality**
- **Message Categorization**: Automatic categorization with dropdown updates
- **Audit Request Templates**: Pre-written response templates for efficiency
- **Project Feed Monitoring**: Real-time updates from audited projects
- **Error Handling**: Robust error handling with fallback data
- **Debug Logging**: Comprehensive logging for troubleshooting
- **Performance Monitoring**: Optimized rendering and reduced lag

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **@dnd-kit/core** - Modern drag-and-drop functionality
- **@dnd-kit/sortable** - Sortable drag-and-drop components

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **Python-telegram-bot** - Telegram integration
- **Tweepy** - Twitter API integration

### Development
- **Docker** - Containerization
- **Pytest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kris15kirov/pag-command-centre-demo.git
   cd pag-command-centre-demo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Docker Setup (Alternative)
```bash
docker-compose up --build
```

## 📊 API Endpoints

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages/{id}/category` - Update message category
- `POST /api/refresh` - Refresh messages from external sources

### Project Feeds
- `GET /api/project-feeds` - Get project feed data
- `POST /api/refresh-feeds` - Refresh project feeds

### Templates
- `GET /api/templates` - Get response templates

## 🎯 Usage Guide

### Filtering Messages
1. **Category Filter**: Click on category buttons (🚨 Urgent, ⚠️ High Priority, etc.)
2. **Source Filter**: Click on source buttons (📱 Telegram, 🐦 Twitter)
3. **Project Filter**: Click on project names to filter by specific projects
4. **Clear Filters**: Use the "Clear Filters" button to reset all filters

### Managing Messages
- **View Details**: Click on message cards to see full content
- **Update Categories**: Use the category dropdown on each message
- **Refresh Data**: Click the "Refresh Messages" button for latest updates
- **Priority Sorting**: Telegram messages automatically appear above Twitter messages

### Template Management
- **Reorder Templates**: Drag and drop templates using the grip handle (⋮⋮)
- **Delete Templates**: Click the red trash icon (🗑️) with confirmation
- **Add New Templates**: Click "+ Add New Template" to open the creation modal
- **Copy Templates**: Click "Copy" button to copy templates to clipboard
- **Custom Templates**: Use `{project}` placeholder for dynamic content

### Template Creation Modal
- **Open Modal**: Click "+ Add New Template" button
- **Enter Content**: Use the textarea for multi-line template content
- **Save Template**: Click "Save Template" to add to your collection
- **Cancel**: Click "Cancel" or "✕" to close without saving

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Twitter Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Database
DATABASE_URL=sqlite:///comms_center.db
```

### Customization
- **Colors**: Modify `tailwind.config.js` for custom color schemes
- **Categories**: Update `models.py` to add new message categories
- **Templates**: Edit templates in `App.js` for custom responses
- **Animations**: Customize CSS animations in `index.css`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
1. Start both backend and frontend
2. Navigate to http://localhost:3000
3. Test all filter combinations
4. Verify message display and categorization
5. Test drag-and-drop template reordering
6. Test template creation and deletion
7. Check error handling with network issues

## 🐛 Troubleshooting

### Common Issues

**Filter Buttons Not Working**
- Check browser console for JavaScript errors
- Verify API endpoints are responding
- Ensure backend server is running

**Messages Not Loading**
- Check backend logs for API errors
- Verify database connection
- Check environment variables

**Template Management Issues**
- Clear browser localStorage if templates aren't saving
- Check for JavaScript errors in console
- Verify drag-and-drop permissions

**Styling Issues**
- Clear browser cache
- Restart frontend development server
- Check Tailwind CSS compilation

### Debug Mode
Enable debug logging by checking the browser console (F12) for detailed logs about:
- API calls and responses
- Filter state changes
- Message processing
- Template operations
- Drag-and-drop events

## 📈 Performance

- **Message Loading**: < 500ms for 50+ messages
- **Filter Response**: < 100ms for real-time filtering
- **API Response**: < 200ms for backend endpoints
- **Memory Usage**: < 50MB for typical usage
- **Template Operations**: < 50ms for drag-and-drop
- **Modal Rendering**: Optimized with GPU acceleration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pashov Audit Group** - For the vision and requirements
- **Web3 Community** - For inspiration and feedback
- **Open Source Contributors** - For the amazing tools and libraries

## 📞 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/kris15kirov/pag-command-centre-demo/issues)
- **Email**: [Contact Pashov Audit Group](mailto:contact@pashov.com)

---

**Built with ❤️ for the Web3 security community**
