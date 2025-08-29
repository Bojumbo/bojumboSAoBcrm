# 🚀 Frontend-Backend Integration Guide

## 📋 Overview

This guide explains how to integrate your existing React CRM frontend with the newly created Node.js/Express backend. The integration provides a complete, production-ready CRM system with real database persistence, authentication, and file handling.

## 🏗️ Architecture

```
Frontend (React + TypeScript) ←→ Backend (Node.js + Express + Prisma) ←→ Database (PostgreSQL)
```

### Frontend Components
- **API Configuration**: Centralized API endpoint management
- **HTTP Client**: Axios-like HTTP client with authentication
- **API Services**: Service layer for all CRUD operations
- **Authentication Context**: React context for user management
- **Protected Routes**: Route protection based on user roles
- **Custom Hooks**: Reusable hooks for API operations
- **Error Handling**: Comprehensive error display components
- **File Upload**: Drag & drop file upload with validation

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file in your frontend root directory:

```bash
# Copy the example file
cp env.example .env

# Edit with your backend URL
VITE_API_BASE_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Backend First

```bash
cd backend
npm start
```

### 4. Start Frontend

```bash
npm run dev
```

## 🔌 API Integration

### Authentication Flow

```typescript
import { useAuth } from './contexts/AuthContext';

const { login, logout, user, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Check authentication
if (isAuthenticated) {
  // User is logged in
}
```

### Making API Calls

```typescript
import { usePaginatedApi } from './hooks/useApi';
import { ProjectsService } from './services/apiService';

const {
  data: projects,
  loading,
  error,
  fetchData,
  refresh
} = usePaginatedApi(ProjectsService.getAll, { page: 1, limit: 10 });

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### File Upload

```typescript
import { FileUpload } from './components/FileUpload';

<FileUpload
  onUploadSuccess={(fileInfo) => {
    console.log('File uploaded:', fileInfo.fileUrl);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

## 🛡️ Protected Routes

### Basic Protection

```typescript
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Role-Based Protection

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

## 📱 Component Examples

### Projects List

```typescript
import { ProjectsList } from './components/ProjectsList';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ProjectsList />
    </div>
  );
}
```

### Error Handling

```typescript
import { ApiErrorDisplay } from './components/ApiErrorDisplay';

{error && (
  <ApiErrorDisplay
    error={error}
    onRetry={refresh}
    onDismiss={() => setError(null)}
  />
)}
```

## 🔐 Authentication

### Login Form

```typescript
import { LoginForm } from './components/LoginForm';

function LoginPage() {
  return <LoginForm />;
}
```

### User Management

```typescript
import { useAuth } from './contexts/AuthContext';

function UserProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h2>Welcome, {user?.first_name} {user?.last_name}</h2>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 📊 Data Management

### CRUD Operations

```typescript
// Create
const newProject = await ProjectsService.create({
  name: 'New Project',
  forecast_amount: 10000
});

// Read
const projects = await ProjectsService.getAll({ page: 1, limit: 10 });

// Update
const updatedProject = await ProjectsService.update(1, {
  name: 'Updated Project Name'
});

// Delete
await ProjectsService.delete(1);
```

### Pagination

```typescript
const {
  data,
  pagination,
  fetchData,
  loadMore
} = usePaginatedApi(ProjectsService.getAll, { page: 1, limit: 20 });

// Load more data
if (pagination.page < pagination.totalPages) {
  await loadMore();
}
```

## 🎨 Styling

The components use Tailwind CSS classes. Make sure you have Tailwind CSS configured in your project.

### Custom Styling

```typescript
<FileUpload
  className="my-custom-upload-area"
  onUploadSuccess={handleUpload}
/>
```

## 🚨 Error Handling

### API Errors

```typescript
import { ApiErrorDisplay, InlineError, ErrorToast } from './components/ApiErrorDisplay';

// Full error display
<ApiErrorDisplay error={error} onRetry={retry} />

// Inline error
<InlineError error={fieldError} />

// Toast notification
<ErrorToast error={toastError} onDismiss={() => setToastError(null)} />
```

### Network Errors

The HTTP client automatically handles:
- Network failures
- HTTP error status codes
- Authentication errors
- File upload failures

## 🔄 State Management

### Local State

```typescript
const [localData, setLocalData] = useState(null);
const { data: apiData, loading, error } = useApi(apiFunction);
```

### Global State

```typescript
import { useAuth } from './contexts/AuthContext';

const { user, isAuthenticated } = useAuth();
```

## 📁 File Structure

```
src/
├── components/
│   ├── ApiErrorDisplay.tsx
│   ├── FileUpload.tsx
│   ├── LoginForm.tsx
│   ├── ProtectedRoute.tsx
│   └── ProjectsList.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useApi.ts
├── services/
│   ├── apiService.ts
│   └── httpClient.ts
├── config/
│   └── api.ts
└── types/
    └── index.ts
```

## 🧪 Testing

### Test API Connection

1. Start the backend server
2. Open browser console
3. Check for any CORS or connection errors
4. Try logging in with test credentials

### Test Credentials

```
Admin: admin@example.com / admin123
Head: ivan.p@example.com / head123
Manager: maria.i@example.com / manager123
```

## 🚀 Deployment

### Development

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
npm run dev
```

### Production

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend URL
2. **Authentication Failures**: Check JWT secret and token expiration
3. **File Upload Issues**: Verify upload directory permissions
4. **Database Connection**: Ensure PostgreSQL is running and accessible

### Debug Mode

Enable debug mode in your `.env`:

```bash
VITE_ENABLE_DEBUG_MODE=true
```

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Prisma Schema](./backend/prisma/schema.prisma)
- [API Endpoints](./backend/src/api/routes/)
- [Type Definitions](./types.ts)

## 🎯 Next Steps

1. **Customize Components**: Adapt components to match your design
2. **Add Features**: Implement additional CRM functionality
3. **Optimize Performance**: Add caching and optimization
4. **Security**: Implement additional security measures
5. **Testing**: Add comprehensive test coverage

## 🤝 Support

For integration issues:
1. Check the backend logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

**Happy Coding! 🎉**
