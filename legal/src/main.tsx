import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
// import * as dotenv from 'dotenv'
// // Import your Publishable Key
// dotenv.config()
const PUBLISHABLE_KEY = "pk_test_YXJ0aXN0aWMtd29vZGNvY2stMjYuY2xlcmsuYWNjb3VudHMuZGV2JA"

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}
console.log('PUBLISHABLE_KEY', PUBLISHABLE_KEY)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)