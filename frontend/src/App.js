import './App.css';
import {useEffect,useState} from 'react';

function App() {

  const [showStatus,setShowStatus] = useState('')

  const getApiStatus = async () => {
    try{
      const data = await fetch('/api/status')
      const res = await data.json()
      setShowStatus(res.status)
    }
    catch(e){
      setShowStatus(`${e}`)
    }
  }

  useEffect(() => {
    getApiStatus()
  },[])

  return (
    <div className="App">
      <header className="App-header">
        💥 FailOps Lab
      </header>
      <div className="App-status">
        {showStatus}
      </div>
    </div>
  );
}

export default App;
