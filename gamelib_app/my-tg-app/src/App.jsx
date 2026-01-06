import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Инициализация WebApp
    WebApp.ready();
    WebApp.expand();
    
    // Пытаемся получить данные пользователя
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user)
    }
  }, [])

  const handleIncrement = () => {
    setCount((count) => count + 1)
    WebApp.HapticFeedback.impactOccurred('medium');
  }

  return (
    <div className="container">
      {userData ? (
        <>
          {/* Аватарка (если есть photo_url, иначе заглушка) */}
          <img 
            src={userData.photo_url} 
            alt="User Avatar" 
            className="avatar"
            // Если аватарки нет, можно скрыть картинку или подставить дефолтную
            onError={(e) => { e.target.style.display = 'none' }} 
          />
          
          <h1 className="username">
            {userData.first_name} {userData.last_name}
          </h1>
          
          <p className="user-tag">
            @{userData.username || 'unknown'}
          </p>

          {/* Карточка с техническими данными */}
          <div className="data-card">
            <div className="data-row">
              <span className="label">ID:</span>
              <span>{userData.id}</span>
            </div>
            <div className="data-row">
              <span className="label">Язык:</span>
              <span>{userData.language_code}</span>
            </div>
            <div className="data-row">
              <span className="label">Premium:</span>
              <span>{userData.is_premium ? 'Да 🌟' : 'Нет'}</span>
            </div>
          </div>
        </>
      ) : (
        /* Если открыли в браузере (не в ТГ) */
        <div className="data-card">
          <p>Пользователь не найден. Открой в Telegram!</p>
        </div>
      )}

      <button onClick={handleIncrement}>
        Очки: {count}
      </button>
    </div>
  )
}

export default App