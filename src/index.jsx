import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Footer from './Footer'
import Header from './Header'

ReactDOM.createRoot(document.getElementById('root'))
  .render(
  <div className="container-fluid mt-3 mx-3">
    <Header />
    <App />
    {/* <Footer /> */}
  </div>
)