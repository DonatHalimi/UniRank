import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import { SubjectList, SubjectDetail } from './pages/Subjects.jsx';
import { MaterialDetail } from './pages/Materials.jsx';
import { Login, Register, Profile } from './pages/Account.jsx';
import { AdminDashboard, Notifications } from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import { Upload } from './components/Upload.jsx';

export default function App() {
  return <AuthProvider><Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="subjects" element={<SubjectList />} />
    <Route path="subjects/:id" element={<SubjectDetail />} />
    <Route path="materials/:id" element={<MaterialDetail />} />
    <Route path="profile/:username" element={<Profile />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="materials/upload" element={<Upload />} />
      <Route path="me" element={<Profile />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>
    <Route element={<ProtectedRoute requiredRole="admin" />}>
      <Route path="admin" element={<AdminDashboard />} />
    </Route>
    <Route path="404" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></AuthProvider>;
}
