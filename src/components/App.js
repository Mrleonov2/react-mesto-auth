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
import * as auth from "../auth.js";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  useHistory,
  Link,
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
  const [email, setEmail] = React.useState("");
  const history = useHistory();
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

  React.useEffect(() => {
    handleTokenCheck();
  }, []);
  function signOut() {
    localStorage.removeItem("jwt");
    setloggedIn(false);
    history.push("/sign-in");
  }

  function handleLogin(password, email) {
    return auth.authorize(password, email).then((data) => {
      if (!data.token) {
        return;
      }
      localStorage.setItem("jwt", data.token);
      setloggedIn(true);
      history.push("/");
    });
  }
  const handleRegister = (password, email) => {
    return auth.register(password, email).then((res) => {
      if (res.ok) {
        history.push("/sign-in");
      }
    });
  };
  function handleTokenCheck() {
    if (localStorage.getItem("jwt")) {
      const jwt = localStorage.getItem("jwt");
      auth.checkToken(jwt).then((res) => {
        if (res) {
          setEmail(res.data.email);
          setloggedIn(true);
          history.push("/");
        }
      });
    }
  }
  function handleCardLike(card, isLiked) {
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setCards((cards) => cards.map((c) => (c._id === card._id ? newCard : c)));
    });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then(() => {
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
      .finally(() => {
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
      .finally(() => {
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
      .finally(() => {
        setAddPlacePopupOpen(false);
        setLoading(false);
      });
  }
  return (
    <div className="App">
      <CurrentUserContext.Provider value={currentUser}>
        <ProtectedRoute exact path="/" loggedIn={loggedIn}>
          <Header
            children={
              <div>
                <p className="header__link">{email}</p>
                <button
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
          <Register onRegister={handleRegister} />
        </Route>
        <Route path="/sign-in">
          <Header
            children={
              <Link to="/sign-up" className="header__link button">
                Регистрация
              </Link>
            }
          />
          <Login onLogin={handleLogin} />
        </Route>
        

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
