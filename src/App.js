import React, { useState, useEffect } from "react";
import "./App.css";
// import html2canvas from 'html2canvas';



const moment = require('moment');



function App() {
  const [page, setPage] = useState(0);
  const [table, setTable] = useState([]);
  // const [image, setImage] = useState('');

  function HomePage(){
    setPage(0);
  };

  function LoadStart(){
    setPage(1);
  };
  
  function LoadPrevious(){
    setPage(2);
  };
  
  if(!page){
    return (
    <div>
      <h1>EEEBalanceBug-Application</h1>
      <button onClick={LoadStart}>Start new test</button>
      <button onClick ={LoadPrevious}>Load previous test</button> 
    </div>
    );
  }

  else if(page === 1){
    return (
      <div>
        <h1>Start</h1>
        <Start setTable={setTable} table={table} setPage={setPage}/> <br/> 
        <button onClick={HomePage}>Back</button>
      </div>
      ); 
  }

  else if (page === 2){
    return (
      <div>
        <h1>Previous</h1>
        <Previous setTable={setTable} table={table}/> <br />
        <button onClick={HomePage}>Back</button>
      </div>
    );
  }

  else{
    return (
      <div> 
        <Maze setPage={setPage}/> 
      </div>
    )
  }
}

    
function Previous({table, setTable}){

  function handleDeletes(index){
    const copy = [...table];
    setTable(copy.filter((entry, i) => i !== index));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Test-name</th>
          <th>Visit</th>
          <th>When</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {table.map((entry, i) => {return(
        <tr key={i}>
          <td>{entry.name}</td>
          <td>{entry.visit}</td>
          <td>{entry.made}</td>
          <td><button onClick={() => handleDeletes(i)}>Delete</button></td>
        </tr>
        )})}
      </tbody>
    </table>
  )
}

function Start({setTable, table, setPage}){
  const [input, setInput] = useState('');

  function handleInput({target}){setInput(target.value)}

  function handleInputPass(){
    if(input.trim() === '' || table.some(entry => entry.name === input.trim())){
      alert('Invalid name or already used');
      return;
    }
    setPage(3);
    const entry = {name: input.trim(), visit: <a href="https://cdnph.upi.com/svc/sv/upi_com/3171685223751/2023/1/8770913281a7b70d5bf30b9c50488a5d/Derrick-White-Celtics-stun-Heat-with-last-second-victory-force-Game-7.jpg">destroyed</a>, made: moment().format('llll')};
    setTable(prev => [entry, ...prev]);
    setInput('');
  }

  return (
  <div>
      <input type="text" id="testname" placeholder="Enter a test name" value={input} onChange={handleInput} />
      <button onClick={handleInputPass}>Submit</button>
  </div>
  )
}

function Maze({setPage}){
  const [cur, setCur] = useState({x:0 , y:0});
  const [trace, setTrace] = useState([])

  useEffect(() => { 
      function handleKey(e){
        let { keyCode } = e;
        let speed = 15;
        if(keyCode === 37){
          if(cur.x - speed <= -window.innerWidth/2 ){
            setCur((prev) => {return {x: -window.innerWidth/2, y: prev.y}})
            
          }
          else{
            setCur((prev) => {return {x: prev.x - speed, y: prev.y}})
           
          }
        }
        else if(keyCode === 38){
          if(cur.y - speed <= -window.innerHeight/2 ){
            setCur((prev) => {return {x: prev.x, y: -window.innerHeight/2 }})
            
          }
          else{
            setCur((prev) => {return {x: prev.x, y: prev.y - speed}})
            
          }
        }
        else if(keyCode === 39){
          if(cur.x + speed >= window.innerWidth/2 -20){
            setCur((prev) => {return {x: window.innerWidth/2 -20 , y: prev.y}})
            
          }
          else{
            setCur((prev) => {return {x: prev.x + speed, y: prev.y}})
            
          }
        }
        else if(keyCode === 40){
          if(cur.y + speed >= window.innerHeight/2 -20){
            setCur((prev) => {return {x: prev.x, y: window.innerHeight/2 -20}})
            
          }
          else{
            setCur((prev) => {return {x: prev.x, y: prev.y + speed}});
          
          }
      }
     
    }
    document.addEventListener('keydown', handleKey);

      return () => {
        document.removeEventListener('keydown', handleKey);
      }
  } 
    , [cur]
  );

  useEffect(() => {setTrace(prev => [...prev, cur])}, [cur])

  const goBack = () => { setPage(0); }

  return (
    <>
      <div>
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {trace.map((pos, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                backgroundColor: 'rgba(0, 200, 0)',
                borderRadius: '50%',
                transform: `translate(${pos.x}px, ${pos.y}px)`,
              }}
            ></div>
          ))}
          <div
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              backgroundColor: 'red',
              borderRadius: '50%',
              transform: `translate(${cur.x}px, ${cur.y}px)`,
            }}
          ></div>
        </div>
      </div>
      <button onClick={goBack}>fuck the heat</button>
    </>
  );
}

export default App;

