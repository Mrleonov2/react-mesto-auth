import React, { useState } from "react";
import "./Login.css";
import { withRouter } from "react-router-dom";
function Login({ handleLogin }) {
  const [loginValue, setLoginValue] = useState({
    email: "",
    password: "",
  });
  function handleChange(e) {
    setLoginValue({ ...loginValue, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!loginValue.password || !loginValue.email) {
      return;
    }
    handleLogin(loginValue.password, loginValue.email).catch((err) =>
      console.log(err)
    );
  }

  return (
    <div className="login">
      <form
        className="login__form"
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        <h2 className="login__heading">Вход</h2>
        <input
          id="email"
          className="login__input"
          placeholder="Email"
          type="email"
          value={loginValue.email}
          name="email"
        ></input>
        <input
          id="password"
          className="login__input"
          placeholder="Пароль"
          type="password"
          value={loginValue.password}
          name="password"
        ></input>
        <button className="login__submit" type="submit">
          Войти
        </button>
      </form>
    </div>
  );
}
export default withRouter(Login);
