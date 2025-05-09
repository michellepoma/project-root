import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import BaseLayout from "./layouts/BaseLayout";
import CourseLayout from "./layouts/CourseLayout";

// Públicas
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Páginas comunes por rol
import MainPage from "./pages/MainPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import JoinCoursePage from "./pages/JoinCoursePage";
import CourseSchedulePage from "./pages/CourseSchedulePage";
import SettingsPage from "./pages/SettingsPage";

// Curso: contenido interno
import CourseOverviewPage from "./pages/CourseOverviewPage";
import CourseAssignmentsPage from "./pages/CourseAssignmentsPage";
import CourseParticipantsPage from "./pages/CourseParticipantsPage";
import CourseGradesPage from "./pages/CourseGradesPage";

// SuperUser
import AdminDashboard from "./pages/AdminDashboard";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import ManageStudentsPage from "./pages/ManageStudentsPage";
import ManageCoursesPage from "./pages/ManageCoursesPage";
import ManageAdminsPage from "./pages/ManageAdminsPage";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Rutas privadas - superuser */}
      <Route element={<PrivateRoute allowedRoles={["superuser"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-teachers" element={<ManageTeachersPage />} />
        <Route path="/admin/manage-students" element={<ManageStudentsPage />} />
        <Route path="/admin/manage-courses" element={<ManageCoursesPage />} />
        <Route path="/admin/manage-admins" element={<ManageAdminsPage />} />
      </Route>

      {/* Rutas privadas - student */}
      <Route element={<PrivateRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<BaseLayout />}>
          <Route index element={<MainPage />} />
          <Route path="my_courses" element={<MyCoursesPage />} />
          <Route path="join_course" element={<JoinCoursePage />} />
          <Route path="schedule" element={<CourseSchedulePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Curso */}
          <Route path="courses/:id" element={<CourseLayout />}>
            <Route index element={<CourseOverviewPage />} />
            <Route path="assignments" element={<CourseAssignmentsPage />} />
            <Route path="participants" element={<CourseParticipantsPage />} />
            <Route path="grades" element={<CourseGradesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Rutas privadas - teacher */}
      <Route element={<PrivateRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<BaseLayout />}>
          <Route index element={<MainPage />} />
          <Route path="my_courses" element={<MyCoursesPage />} />
          <Route path="schedule" element={<CourseSchedulePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Curso */}
          <Route path="courses/:id" element={<CourseLayout />}>
            <Route index element={<CourseOverviewPage />} />
            <Route path="assignments" element={<CourseAssignmentsPage />} />
            <Route path="participants" element={<CourseParticipantsPage />} />
            <Route path="grades" element={<CourseGradesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
