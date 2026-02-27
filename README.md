# PuConnect

PuConnect is a comprehensive platform designed to connect users through various features such as chat, listings, payments, recommendations, and reviews. It integrates a robust backend, a dynamic frontend, and machine learning services to deliver a seamless user experience.

## Installation Instructions

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Machine Learning Service

1. Navigate to the `ml-service` directory:
   ```bash
   cd ml-service
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the ML service:
   ```bash
   python inference.py
   ```

## Usage Guide

1. Access the frontend application at the URL provided by the development server.
2. Register or log in to your account.
3. Explore features such as:
   - Chat with other users.
   - Browse and manage listings.
   - Make secure payments.
   - Receive personalized recommendations.
   - Leave and view reviews.

## Contribution Guidelines

We welcome contributions to PuConnect! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request and describe your changes.

Thank you for contributing to PuConnect!
