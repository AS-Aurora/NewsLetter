# 📚 Newsletter - Document Flipbook Viewer

A modern web application that converts PDF and DOCX documents into an interactive flipbook experience. Upload your documents and read them as if you're flipping through a real book!

![Project Banner](https://img.shields.io/badge/Django-5.2.7-green) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)

## ✨ Features

- 📄 **Document Upload**: Support for PDF and DOCX files
- 📖 **Flipbook Experience**: Realistic page-turning animations
- 🖼️ **Page Preview**: Each page is converted to an image for smooth viewing
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Beautiful UI**: Modern interface built with Tailwind CSS
- ⚡ **Fast & Smooth**: Built with React and Vite for optimal performance

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **react-pageflip** - Flipbook functionality
- **Lucide React** - Icons

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API development
- **Python** - Programming language
- **SQLite** - Database
- **Pillow** - Image processing
- **pdf2image** - PDF to image conversion
- **python-docx** - DOCX processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
1. **Python 3.8 or higher**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version`

2. **Node.js 16 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

4. **Poppler** (for PDF processing)
   - **Windows**: Download from [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases/)
     - Extract the zip file
     - Add the `bin` folder to your system PATH
   - **macOS**: `brew install poppler`
   - **Linux**: `sudo apt-get install poppler-utils`

## 🚀 Installation Guide

Follow these steps carefully to set up the project on your local machine.

### Step 1: Clone or Download the Repository

```bash
git clone https://github.com/AS-Aurora/NewsLetter.git
cd NewsLetter
```

### Step 2: Backend Setup (Django)

1. **Navigate to the backend folder**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   
   **Windows:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install django djangorestframework django-cors-headers pillow pdf2image python-docx mammoth
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (optional, for admin access)**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to set username, email, and password.

6. **Start the Django development server**
   ```bash
   python manage.py runserver
   ```
   
   The backend should now be running at `http://localhost:8000`

   ⚠️ **Keep this terminal window open!**

### Step 3: Frontend Setup (React)

1. **Open a new terminal window** (keep the backend running)

2. **Navigate to the frontend folder**
   ```bash
   cd frontend
   ```
   (If you're starting from the backend folder, use `cd ../frontend`)

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```
   This might take a few minutes.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend should now be running at `http://localhost:5173`

## 📁 Project Structure

```
NewsLetter/
├── backend/                    # Django backend
│   ├── api/                   # Main API app
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   ├── urls.py           # API routes
│   │   └── utils.py          # Document processing utilities
│   ├── backend/              # Django project settings
│   │   ├── settings.py       # Configuration
│   │   └── urls.py           # Main URL routing
│   ├── media/                # Uploaded files and processed pages
│   ├── manage.py             # Django management script
│   └── db.sqlite3            # SQLite database
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── main.tsx          # Entry point
│   │   └── assets/           # Static assets
│   ├── public/               # Public files
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS config
│
└── README.md                 # This file
```
