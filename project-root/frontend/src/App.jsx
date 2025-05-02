import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import BaseLayout from "./layouts/BaseLayout";
import CourseLayout from "./layouts/CourseLayout";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegisterPage from "./pages/RegisterPage";

import MainPage from "./pages/MainPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import JoinCoursePage from "./pages/JoinCoursePage";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import CourseAssignmentsPage from "./pages/CourseAssignmentsPage";
import CourseParticipantsPage from "./pages/CourseParticipantsPage";
import CourseGradesPage from "./pages/CourseGradesPage";
import CourseSchedulePage from "./pages/CourseSchedulePage";

function App() {
  return (
    <Routes>

      {/* PÚBLICAS */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* PRIVADAS - CON BASELAYOUT */}
      <Route element={<PrivateRoute><BaseLayout /></PrivateRoute>}>
        <Route path="/main" element={<MainPage />} />
        <Route path="/my_courses" element={<MyCoursesPage />} />
        <Route path="/join_course" element={<JoinCoursePage />} />
        <Route path="/schedule" element={<CourseSchedulePage />} />

        {/* RUTAS DE CURSO CON SUBRUTAS */}
        <Route path="/courses/:id" element={<CourseLayout />}>
          <Route index element={<CourseOverviewPage />} />
          <Route path="assignments" element={<CourseAssignmentsPage />} />
          <Route path="participants" element={<CourseParticipantsPage />} />
          <Route path="grades" element={<CourseGradesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
