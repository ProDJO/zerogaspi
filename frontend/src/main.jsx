import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './useAuth.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { LanguageProvider } from './LanguageContext.jsx'
import { CartProvider } from './CartContext.jsx'
import { FavoritesProvider } from './FavoritesContext.jsx'
import { NotificationsProvider } from './NotificationsContext.jsx'
import './index.css'
import App from './App.jsx'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <NotificationsProvider>
                  <App />
                </NotificationsProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)