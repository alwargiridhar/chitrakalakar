# ChitraKalakar - Complete Tech Stack

## 🎨 Platform Overview
ChitraKalakar is a full-stack art marketplace and community platform connecting artists with art lovers, featuring artist portfolios, virtual exhibitions, art class enquiries, and commission services.

---

## 🖥️ Frontend Stack

### Core Framework & Library
- **React** `19.0.0` - UI library
- **React DOM** `19.0.0` - DOM rendering
- **React Router DOM** `7.5.1` - Client-side routing

### Build Tools
- **Create React App** `5.0.1` (via react-scripts)
- **CRACO** `7.1.0` - Create React App Configuration Override
- **Node.js** `18.x` - Runtime environment

### Styling & UI Components
- **Tailwind CSS** `3.4.17` - Utility-first CSS framework
- **PostCSS** `8.4.49` - CSS processing
- **Autoprefixer** `10.4.20` - CSS vendor prefixing
- **tailwindcss-animate** `1.0.7` - Animation utilities
- **tailwind-merge** `3.2.0` - Merge Tailwind classes
- **class-variance-authority** `0.7.1` - Component variants
- **clsx** `2.1.1` - Conditional class names

### UI Component Libraries
- **Radix UI** - Headless accessible components:
  - Accordion `1.2.8`
  - Alert Dialog `1.1.11`
  - Avatar `1.1.7`
  - Checkbox `1.2.3`
  - Dialog `1.1.11`
  - Dropdown Menu `2.1.12`
  - Navigation Menu `1.2.10`
  - Popover `1.1.11`
  - Radio Group `1.3.4`
  - Select `2.2.2`
  - Slider `1.3.2`
  - Switch `1.2.2`
  - Tabs `1.1.9`
  - Toast `2.2.11`
  - Tooltip `2.2.4`
  - And more...

- **Lucide React** `0.507.0` - Icon library
- **cmdk** `1.1.1` - Command menu component
- **Sonner** `2.0.3` - Toast notifications
- **Vaul** `1.1.2` - Drawer component
- **Embla Carousel** `8.6.0` - Carousel/slider

### Form Management
- **React Hook Form** `7.56.2` - Form validation and management
- **@hookform/resolvers** `5.0.1` - Validation resolvers
- **Zod** `3.24.4` - Schema validation
- **input-otp** `1.4.2` - OTP input component

### Date & Time
- **React Day Picker** `8.10.1` - Date picker
- **date-fns** `4.1.0` - Date utility library

### State Management & Data Fetching
- **Axios** `1.8.4` - HTTP client
- **React Context API** - Built-in state management

### Storage & Backend Integration
- **Supabase JS** `2.89.0` - Backend-as-a-Service client
  - File storage (avatars, artworks, exhibitions)
  - Authentication support
  - Real-time capabilities

### Theme & Styling
- **next-themes** `0.4.6` - Theme management (dark/light mode support)
- **react-resizable-panels** `3.0.1` - Resizable panel layouts

### Package Manager
- **Yarn** `1.22.22` - Dependency management

### Code Quality & Linting
- **ESLint** `9.23.0` - JavaScript/React linting
- **eslint-plugin-import** `2.31.0`
- **eslint-plugin-jsx-a11y** `6.10.2` - Accessibility linting
- **eslint-plugin-react** `7.37.4`
- **eslint-plugin-react-hooks** `5.2.0`

---

## 🔧 Backend Stack

### Core Framework
- **FastAPI** `0.110.1` - Modern Python web framework
- **Uvicorn** `0.25.0` - ASGI server
- **Python** `3.10+` - Programming language

### Database
- **MongoDB** - NoSQL database
- **PyMongo** `4.5.0` - MongoDB driver
- **Motor** `3.3.1` - Async MongoDB driver

### Data Validation
- **Pydantic** `2.6.4+` - Data validation using Python type hints
- **email-validator** `2.2.0+` - Email validation

### Authentication & Security
- **PyJWT** `2.10.1+` - JSON Web Token implementation
- **python-jose** `3.3.0+` - JavaScript Object Signing and Encryption
- **bcrypt** `4.1.3` - Password hashing
- **Passlib** `1.7.4+` - Password hashing utilities
- **cryptography** `42.0.8+` - Cryptographic recipes

### Cloud & Storage
- **boto3** `1.34.129+` - AWS SDK (for potential S3 integration)
- **Supabase** - File storage for images

### HTTP & API
- **requests** `2.31.0+` - HTTP library
- **requests-oauthlib** `2.0.0+` - OAuth library
- **python-multipart** `0.0.9+` - Multipart form data parsing

### Data Processing
- **Pandas** `2.2.0+` - Data manipulation
- **NumPy** `1.26.0+` - Numerical computing

### Development Tools
- **python-dotenv** `1.0.1+` - Environment variable management
- **typer** `0.9.0+` - CLI application framework
- **jq** `1.6.0+` - JSON processor

### Testing & Code Quality
- **pytest** `8.0.0+` - Testing framework
- **black** `24.1.1+` - Code formatter
- **isort** `5.13.2+` - Import sorter
- **flake8** `7.0.0+` - Style guide enforcement
- **mypy** `1.8.0+` - Static type checker

### Date & Time
- **tzdata** `2024.2+` - Timezone database

---

## 🗄️ Database & Storage

### Primary Database
- **MongoDB** - Document-based NoSQL database
  - Collections: users, artworks, exhibitions, orders, featured_artists, art_class_enquiries

### File Storage
- **Supabase Storage** - Cloud file storage
  - Buckets: avatars, artworks, exhibitions
  - CDN-backed image delivery
  - Automatic image optimization

### Caching (Potential)
- In-memory caching for frequently accessed data

---

## 🚀 Deployment & Infrastructure

### Frontend Hosting
- **Vercel** - Serverless deployment platform
  - Automatic deployments from Git
  - Edge network CDN
  - Environment variables management
  - Preview deployments

### Backend Hosting
- **Render** - Cloud platform
  - Container-based deployment
  - Auto-scaling
  - Background workers support
  - Managed database connections

### Version Control
- **Git** - Version control system
- **GitHub** - Code hosting and collaboration
  - Repository: alwargiridhar/Main-Chitrakalakar

### CI/CD
- **Vercel Auto-Deployments** - Frontend CI/CD
- **Render Auto-Deployments** - Backend CI/CD

---

## 🔐 Authentication & Authorization

### Strategy
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **Role-based Access Control (RBAC)**
  - Roles: user, artist, admin, lead_chitrakar, kalakar, institution

### Session Management
- Token-based authentication
- HTTP-only cookies (potential)
- Local storage for client-side tokens

---

## 🎨 Design System

### Design Principles
- Mobile-first responsive design
- Accessible (WCAG compliant via Radix UI)
- Gradient color schemes (Orange to Yellow brand colors)
- Card-based layouts
- Modal-driven interactions

### Color Palette
- Primary: Orange (`#f97316`)
- Secondary: Yellow (`#eab308`)
- Gradients: Orange-to-Yellow
- Neutral: Gray scales
- Accents: Green (success), Red (errors), Blue (info)

### Typography
- System fonts stack
- Sans-serif primary font family
- Responsive font sizing

---

## 📦 Key Features & Technologies

### Image Upload & Processing
- **Supabase Storage** - Cloud storage
- **Canvas API** - Client-side image compression
- **File API** - File handling
- Automatic image optimization (resize, compress)
- Support for multiple image formats (JPG, PNG, WebP)

### Real-time Features (Potential)
- Live exhibition updates
- Real-time notifications
- WebSocket support via Supabase

### Search & Filtering
- Category-based filtering
- Location-based artist matching
- Budget range filters
- Skill level filtering

### Email & Notifications
- Email validation
- Notification system (via Sonner toasts)
- Potential: SendGrid/Twilio integration

---

## 🛠️ Development Tools

### Local Development
- **VS Code** - Recommended IDE
- **Chrome DevTools** - Browser debugging
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

### Code Quality
- ESLint configuration
- Prettier (implied via project structure)
- Git hooks (potential)
- Pre-commit checks

### Environment Management
- `.env` files for configuration
- Separate environments (development, staging, production)
- Environment variable validation

---

## 📊 Analytics & Monitoring (Potential/Future)

### Performance Monitoring
- Vercel Analytics
- Render Metrics
- Custom dashboard analytics

### Error Tracking
- Console logging
- Error boundaries (React)
- Backend error handling with FastAPI

### User Analytics
- Page view tracking
- User behavior analytics
- Exhibition view counts
- Artist profile visits

---

## 🔒 Security Features

### Frontend Security
- HTTPS enforcement
- XSS prevention (React's built-in protection)
- CSRF tokens (potential)
- Input sanitization
- Content Security Policy headers

### Backend Security
- Password hashing (bcrypt)
- JWT token expiration
- CORS configuration
- Rate limiting (potential)
- SQL injection prevention (NoSQL)
- Input validation (Pydantic)

### Data Protection
- Environment variable encryption
- Secure cookie flags
- HTTPS-only communication
- Role-based access control

---

## 📱 Mobile & Responsive

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl (Tailwind)
- Touch-friendly interfaces
- Responsive images
- Mobile navigation menu

### Progressive Web App (PWA) Potential
- Service workers
- Offline support
- Add to home screen
- Push notifications

---

## 🌐 Browser Support

### Supported Browsers
**Production:**
- Chrome (>0.2% usage)
- Safari (>0.2% usage)
- Firefox (>0.2% usage)
- Edge (>0.2% usage)
- Not Opera Mini

**Development:**
- Latest Chrome
- Latest Firefox
- Latest Safari

---

## 📈 Scalability

### Frontend Scalability
- Vercel Edge Network (global CDN)
- Code splitting (React lazy loading)
- Image optimization
- Asset caching

### Backend Scalability
- Horizontal scaling via Render
- Database indexing (MongoDB)
- Connection pooling (Motor)
- Async request handling (FastAPI)
- Background jobs (potential)

### Database Scalability
- MongoDB sharding (potential)
- Read replicas (potential)
- Indexing strategies
- Query optimization

---

## 🔄 API Architecture

### API Design
- RESTful API principles
- JSON request/response format
- Versioned endpoints (potential)
- Pagination support
- Error handling with standard HTTP codes

### API Documentation
- FastAPI auto-generated docs (`/docs`)
- Swagger UI interface
- OpenAPI 3.0 specification

### Endpoints Structure
```
/api/auth/*          - Authentication
/api/public/*        - Public endpoints
/api/admin/*         - Admin operations
/api/artist/*        - Artist operations
```

---

## 🧪 Testing Stack

### Frontend Testing (Potential)
- React Testing Library
- Jest
- Cypress/Playwright for E2E

### Backend Testing
- pytest - Unit tests
- FastAPI TestClient
- Coverage reporting

---

## 📚 Documentation

### Code Documentation
- Inline comments
- Function docstrings (Python)
- JSDoc comments (JavaScript)

### Project Documentation
- README.md
- IMPLEMENTATION_SUMMARY.md
- DEPLOYMENT_GUIDE.md
- VERCEL_RENDER_DEPLOYMENT.md
- API documentation (auto-generated)

---

## 🎯 Performance Optimizations

### Frontend Optimizations
- Code splitting
- Lazy loading
- Image compression
- Asset minification
- Tree shaking
- Gzip compression

### Backend Optimizations
- Async/await patterns
- Database connection pooling
- Query optimization
- Response caching (potential)
- CDN for static assets

---

## 🔮 Future Technology Considerations

### Potential Additions
- Redis - Caching layer
- Celery - Background task processing
- WebSockets - Real-time features
- GraphQL - Alternative to REST
- TypeScript - Type safety for frontend
- Docker - Containerization
- Kubernetes - Orchestration
- Stripe - Payment processing
- SendGrid - Email service
- Google Analytics - User analytics

---

## 📊 Tech Stack Summary Table

| Category | Technologies |
|----------|-------------|
| **Frontend Framework** | React 19.0.0 |
| **Backend Framework** | FastAPI 0.110.1 |
| **Database** | MongoDB |
| **File Storage** | Supabase Storage |
| **Styling** | Tailwind CSS 3.4.17 |
| **Build Tool** | CRACO 7.1.0 |
| **Package Manager** | Yarn 1.22.22 |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Authentication** | JWT + bcrypt |
| **HTTP Client** | Axios 1.8.4 |
| **Form Management** | React Hook Form 7.56.2 |
| **Validation** | Zod 3.24.4 (Frontend), Pydantic 2.6.4+ (Backend) |
| **Icons** | Lucide React 0.507.0 |
| **UI Components** | Radix UI |
| **Version Control** | Git + GitHub |

---

## 🏗️ Architecture Pattern

### Frontend Architecture
- Component-based architecture
- Context API for state management
- Custom hooks for reusable logic
- Modular file structure

### Backend Architecture
- Layered architecture
- API routes → Business logic → Database
- Dependency injection (FastAPI)
- Async/await patterns

### Overall Architecture
- **JAMstack** principles
- Microservices approach (frontend/backend separation)
- API-first design
- Serverless deployment

---

## 📝 Conclusion

ChitraKalakar uses a modern, scalable tech stack combining:
- **React** for a dynamic, responsive frontend
- **FastAPI** for a fast, async Python backend
- **MongoDB** for flexible document storage
- **Supabase** for managed file storage
- **Vercel + Render** for seamless deployment

This stack provides excellent developer experience, performance, and scalability for an art marketplace platform.

---

**Last Updated:** January 2025  
**Platform:** ChitraKalakar  
**Version:** 2.0
