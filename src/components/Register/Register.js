import React from "react";
import "./Register.css";
import * as auth from "../../auth.js";

function Register({handleRegister}) {
  const [registerValue,setRegisterValue]= React.useState({email:'',password:''});
  function handleChange(e) {
    setRegisterValue({...registerValue ,[e.target.name]:e.target.value});
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!registerValue.password || !registerValue.email) {
      return;
    }
    handleRegister(registerValue.password, registerValue.email).catch((err) => console.log(err))
  }
  return (
    <div className="register">
      <form className="register__form" onChange={handleChange} onSubmit={handleSubmit}>
        <h2 className="register__heading">Регистрация</h2>
        <input
          id="email"
          className="register__input"
          placeholder="Email"
          type="email"
          value={registerValue.email}
          name="email"
        ></input>
        <input
          id="password"
          className="register__input"
          placeholder="Пароль"
          type="password"
          value={registerValue.password}
          name="password"
        ></input>
        <button className="register__submit" type="submit">
          Зарегистрироваться
        </button>
        <p>Уже зарегистрированы? Войти</p>
      </form>
    </div>
  );
}
export default Register;
