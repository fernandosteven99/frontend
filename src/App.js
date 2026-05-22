import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Sports from "./components/Sports";
import Instructor from "./components/Instructor";
import Admin from "./components/Admin";
import Report from "./components/Report";
import Student from "./components/Student";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/student" element={<Student />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;