import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import React from "react";
import Register from "./Register/Register";
import Login from "./Login/Login";
import InfoTooltip from "./InfoTooltip/InfoTooltip";
import * as auth from '../auth.js';
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  Link,
  useHistory,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { api } from "../utils/Api.js";
function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({
    link: "",
    name: "",
  });
  const [isImagePopupOpen, setImagePopupOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({
    name: "",
    about: "",
    avatar: "",
    
  });
  
  const [cards, setCards] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [loggedIn, setloggedIn] = React.useState(false);
const [email,setEmail] =React.useState('');
  React.useEffect(() => {
    Promise.all([api.getProfile(), api.getInitialCards()])
      .then(([userData, initialCards]) => {
        setCurrentUser(userData);
        setCards(initialCards);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const history = useHistory();
  function signOut() {
    localStorage.removeItem("jwt");
    history.push("/login");
  }
  function handleLogin({password,email}) {
     return auth
      .authorize(password,email)
      .then((data) => {if (!data.jwt) {
        return
        }
        localStorage.setItem('jwt', data.jwt);
        setloggedIn(true);
          history.push("/");
      }).catch((err) => console.log(err));
  }
  const handleRegister = (username, password, email) => {
    return auth
        .register(username, password, email)
        .then((res) => {
          if (res.statusCode !== 400) {
            history.push("/login");
          }
            
        });
}
  function  handleTokenCheck(){
    if (localStorage.getItem('jwt')){
      const jwt = localStorage.getItem('jwt');
      auth.checkToken(jwt).then((res)=>{ if (res){  history.push("/");
      setEmail(res.email)
    setloggedIn(true)}})
    }}
  function handleCardLike(card, isLiked) {
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setCards((cards) => cards.map((c) => (c._id === card._id ? newCard : c)));
    });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then((newCard) => {
      setCards((cards) => cards.filter((c) => c._id !== card._id));
    });
  }
  function closeAllPopups(event) {
    if (
      event.target.classList.contains("popup_opened") ||
      event.target.classList.contains("popup__button-close")
    ) {
      setEditProfilePopupOpen(false);
      setAddPlacePopupOpen(false);
      setEditAvatarPopupOpen(false);
      setImagePopupOpen(false);
    }
  }
  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }
  function handleCardClick(card) {
    setImagePopupOpen(true);
    setSelectedCard(card);
  }
  function handleUpdateUser({ name, about }) {
    setLoading(true);
    api
      .editProfile(name, about)
      .then((userData) => {
        setCurrentUser(userData);
      })
      .then(() => {
        setEditProfilePopupOpen(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function handleUpdateAvatar({ avatar }) {
    setLoading(true);
    api
      .editAvatar(avatar)
      .then((userData) => {
        setCurrentUser(userData);
      })
      .then(() => {
        setEditAvatarPopupOpen(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function handleAddPlaceSubmit({ name, link }) {
    setLoading(true);
    api
      .addCard(name, link)
      .then((newCard) => {
        console.log(newCard);
        setCards([newCard, ...cards]);
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        setAddPlacePopupOpen(false);
        setLoading(false);
      });
  }
  return (
    <div className="App">
      <CurrentUserContext.Provider value={currentUser}>
        <Switch>
          <ProtectedRoute exact path="/" loggedIn={loggedIn} >
            <Header
              children={
                <div>
                  <p className="header__link">{email}</p>
                  <button
                    to="/sign-in"
                    className="header__link header__button button"
                    onClick={signOut}
                  >
                    Выйти
                  </button>
                </div>
              }
            />
            <Main
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              cards={cards}
            />
            <Footer />
          </ProtectedRoute>
          <Route path="/sign-up">
            <Header
              children={
                <Link to="/sign-in" className="header__link button">
                  Войти
                </Link>
              }
            />
            <Register handleRegister={handleRegister}/>
          </Route>
          <Route path="/sign-in">
            <Header
              children={
                <Link to="/sign-up" className="header__link button">
                  Регистрация
                </Link>
              }
            />
            <Login handleLogin={handleLogin} />
          </Route>
          <Route>
            {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
          </Route>
        </Switch>
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
          isLoading={isLoading}
        />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          isLoading={isLoading}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
          isLoading={isLoading}
        />
        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups}
          name="image"
          isOpen={isImagePopupOpen}
        ></ImagePopup>
        <InfoTooltip />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
