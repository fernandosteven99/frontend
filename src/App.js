import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Sports from "./components/Sports";
import Instructor from "./components/Instructor";
import Admin from "./components/Admin";
import Student from "./components/Student";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <BrowserRouter>
      <ChatWidget />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/student" element={<Student />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
