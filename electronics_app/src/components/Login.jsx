import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appContext } from "../App";
import { useContext } from "react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const Navigate = useNavigate();
  const { user, setUser } = useContext(appContext);
  const [msg, setMsg] = useState();
  const [loading, setLoading] = useState(false); // <-- New loading state
  const API =  import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      const url = `${API}/api/user/login`;
      const result = await axios.post(url, user);
      setLoading(false); // Stop loading
      Navigate("/");
    } catch (err) {
      console.log(err);
      setMsg("!!!Invalid credentials");
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="Login-Wrapper">
      <h2>Login</h2>
      {msg && <div className="error slide-down">{msg}</div>}
      <p>
        <input
          type="text"
          placeholder="Email address"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
      </p>
      <p>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setUser({ ...user, pass: e.target.value })}
        />
      </p>
      <p align="center">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? <div className="spinner"></div> : "Log In"}
        </button>
      </p>
      <p>
        <Link to="../register">New User? Register Here</Link>
      </p>
    </div>
  );
}