//frontend/src/App.jsx
import PrivateRoute from "./components/PrivateRoute";
import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import BaseLayout from "./layouts/BaseLayout";

function App() {
  return (
    <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<PrivateRoute><BaseLayout /></PrivateRoute>}>
      <Route path="/main" element={<MainPage />} />
    </Route>
  </Routes>
  );
}

export default App;
