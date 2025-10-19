import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8000/api/hello/')
      const data = await response.json()
      setData(data.message)
    }

    fetchData()
  }, [])
  return (
    <div>
      {data}
    </div>
  )
}

export default App
