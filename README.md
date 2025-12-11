# 🧭 Compass QA - AI-Powered Test Case Generator

An intelligent test case design generator powered by Google's Gemini AI. Transform user stories into comprehensive test cases with professional Excel exports.

## ✨ Features

- 🤖 AI-powered test case generation using Gemini 2.5 Flash
- 📊 Professional Excel export with formatted tables
- 🎨 Beautiful, modern UI with glassmorphism design
- 📝 Test case refinement with AI chatbot
- 📜 Project history tracking
- 🔒 Secure API key management

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Test Case"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Then edit `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔒 Security Setup

**IMPORTANT:** Your API key must be kept secure and never committed to version control.

### Local Development

- API key is stored in `.env` file (gitignored)
- See [API_KEY_SECURITY.md](./API_KEY_SECURITY.md) for detailed security guide

### GitHub Pages Deployment

1. Go to your repository → Settings → Secrets and variables → Actions
2. Create a new secret named `VITE_GEMINI_API_KEY`
3. Paste your API key as the value
4. Push to `main` branch to trigger deployment

**📚 Read the full security guide:** [API_KEY_SECURITY.md](./API_KEY_SECURITY.md)

## 📦 Project Structure

```
Test Case/
├── src/
│   ├── components/       # React components
│   ├── utils/           # Utilities (AI service, Excel generator)
│   ├── styles/          # CSS styles
│   └── main.jsx         # App entry point
├── public/              # Static assets
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment template
└── API_KEY_SECURITY.md  # Security documentation
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Documentation

- [API Key Security Guide](./API_KEY_SECURITY.md) - Complete security documentation
- [Security Checklist](./SECURITY_CHECKLIST.md) - Pre-deployment checklist
- [Project Documentation](./DOCUMENTATION.md) - Feature documentation

## 🔐 Security Checklist

Before deploying or committing code:

- [ ] `.env` file is gitignored
- [ ] No hardcoded API keys in source code
- [ ] GitHub Secret is configured for deployment
- [ ] Ran security audit: `git grep -i "AIza"`

See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for complete checklist.

## 🌐 Deployment

This project is configured for GitHub Pages deployment using GitHub Actions.

**Deployment happens automatically** when you push to the `main` branch.

### First-Time Deployment Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Add `VITE_GEMINI_API_KEY` secret (see Security Setup above)
4. Push to `main` branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security checklist
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
- Check [API_KEY_SECURITY.md](./API_KEY_SECURITY.md) for security-related issues
- Review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for deployment issues
- Check the troubleshooting section in documentation

---

**Built with ❤️ using React, Vite, and Google Gemini AI**
