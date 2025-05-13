# FlavorConnect

FlavorConnect is a modern recipe sharing and social networking application that allows users to discover, share, and connect over food. The platform combines Pinterest-like recipe pinning with real-time chat functionality, enabling users to share their culinary creations and engage with a community of food enthusiasts.

## 🌟 Features

- **User Authentication**: Sign up, sign in, and profile management using NextAuth and Firebase
- **Recipe Management**: Create, browse, and search recipes with detailed information
- **Visual Recipe Sharing**: Pinterest-style pin interface for recipe discovery
- **Advanced Search**: AI-powered search engine using Word2Vec for semantic recipe search
- **Social Interaction**: Comments, favorites, and user follows
- **Real-time Chat**: Connect with other users through individual and group chats
- **Responsive UI**: Beautiful interface built with Next.js and Tailwind CSS

## 🔧 Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) - React framework for server-side rendering
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Authentication and cloud storage
- [NextAuth](https://next-auth.js.org/) - Authentication solution for Next.js
- [React Icons](https://react-icons.github.io/react-icons/) - Icon components

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Word2Vec](https://radimrehurek.com/gensim/models/word2vec.html) - Natural language processing for recipe search
- [Uvicorn](https://www.uvicorn.org/) - ASGI server

### Databases
- [MySQL](https://www.mysql.com/) - Relational database for users, recipes, comments
- [MongoDB](https://www.mongodb.com/) - NoSQL database for chat functionality

### Deployment
- [Docker](https://www.docker.com/) - Containerization platform
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/HelenWu2004/CS222Project.git
   cd FlavorConnect
   ```

2. Start all services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🧰 Development

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Backend Development

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload
```

## 📚 API Endpoints

FlavorConnect's backend provides the following API endpoints:

- **/users** - User management and profiles
- **/recipes** - Recipe CRUD operations
- **/comments** - User comments on recipes
- **/favorites** - User favorite recipes
- **/chat** - Real-time chat functionality
- **/chatbot** - AI assistance for cooking
- **/search** - Recipe search functionality
- **/spoonacular** - Integration with Spoonacular API

## 🧪 Testing

The application includes both frontend and backend tests:

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest
```

## 💻 Project Structure

```
FlavorConnect/
├── app/                  # Next.js frontend
│   ├── components/       # React components
│   ├── api/              # API routes
│   ├── [userId]/         # User profile page
│   ├── pin/              # Pin detail page
│   ├── chat/             # Chat interface
│   ├── recipe/           # Recipe pages
│   └── ...
├── backend/              # FastAPI backend
│   ├── routers/          # API route handlers
│   ├── main.py           # Main application entry
│   ├── search_engine.py  # Recipe search engine
│   └── ...
├── docker-compose.yml    # Docker configuration
└── ...
```

## 📋 Future Improvements

- Mobile application version
- Enhanced recipe recommendation system
- Video tutorials and live streaming
- Expanded social features
- Internationalization and localization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Authors

- Helen Wu - [GitHub Profile](https://github.com/HelenWu2004)

