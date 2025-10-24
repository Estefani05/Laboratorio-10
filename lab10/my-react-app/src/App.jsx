import { useState } from 'react'
import Products from './components/Products'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Catálogo de Productos</h1>
      <Products />
    </div>
  )
}

export default App
