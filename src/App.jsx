import './App.css'
import { useState, useEffect } from "react";

export default function App() {
  // [variable, functionToUpdate] = useState(defaultValue)
  let [colonists, updateColonists] = useState(17);
  let [shipSize, updateShipSize] = useState(500);
  let [housing, updateHousing] = useState(10000000);
  let [day, updateDay] = useState(1);
  let [resources, updateResources] = useState(5000);
  let [jobs, updateJobs] = useState(50)

  function validateIncrease(variable, updateFunc, increase, maximum, costVariable = resources, costFunc = updateResources, costAmount = 0) {
    if (costAmount <= costVariable) {
      if (variable + increase < maximum) {
        updateFunc(variable + increase);
        costFunc(costVariable - costAmount)
      }
      else {
        updateFunc(maximum);
      }
    }
  }

  function sendColonists(a) {
    // Updates the specified value
    // updating as a function queues it up properly
    validateIncrease(colonists, updateColonists, shipSize, housing, resources, updateResources, 1000);
    // updateColonists(colonists => colonists + shipSize)
  }

  function dailyCycle() {
    // Rounded down(0.2-1.2 * (colonists/20000) + 0.92)
    // Chances for increases even at very low pops, if random rolls 1.1+, that * 0.92 > 1
    // With 17 colonists its 0.2-1.2 * 0.92085
    // 20000 pop guarentees 1 per cycle, which i think is realistic (world pop/births per day)
    let increase = Math.floor((Math.random() + 0.11) * ((colonists / 21500) + 0.92));
    updateDay(day + 1);
    // console.log(((Math.random() + 0.11) * ((colonists / 21500) + 0.92)));
    validateIncrease(colonists, updateColonists, increase, housing);
    // console.log("func", colonists)
    // if (colonists + increase < housing){
    //   updateColonists(colonists => colonists + increase)
    // }
    // else{
    //   updateColonists(housing)
    // }
  }

  function upgradeShip() {
    updateShipSize(shipSize => shipSize + 100)
  }

  function upgradeHousing() {
    updateHousing(housing => housing + 500);
  }

  // console.log("before use ef", colonists)
  useEffect(() => {
    const interval = setInterval(() => {
      // console.log("use ef", colonists)
      dailyCycle();
    }, 1000);
    return () => clearInterval(interval);
  }, [colonists, day]);

  // console.log("main", colonists)

  return (
    <main>
      {/* <p>React ⚛️ + Vite ⚡ + Replit 🌀</p> */}
      <p className="fs-6">Day: {day}</p>
      <section className="stats-block">
        <div className="stats-row">
          <p className="stats-label border border-2">{colonists} colonists</p>
          <p className="stats-label border border-2">Resources: {resources}</p>
        </div>
        <div className="stats-row">
          <p className="stats-label border border-2">Daily growth rate: {Math.round(((colonists / 21500) + 0.04) * 100) / 100}</p>
          <p className="stats-label border border-2">Ship size: {shipSize}</p>

        </div>
        <div className="stats-row">
          <p className="stats-label border border-2">Housing space: {housing}</p>
          <p className="stats-label border border-2">Jobs: {jobs}</p>
        </div>
        <div className="stats-row">
          <p className="stats-label border border-2">Colonist efficiency: 0-1</p>

        </div>

      </section>

      <div className="but-row mt-2">

        <div className="but-label">
          <button id="send-ship-but" onClick={() => sendColonists(1)}>Send a colonist ship (+{+shipSize})</button>
          <label htmlFor="send-ship-but">Cost: 1000 resources</label>
        </div>

        <div className="but-label">
          <button onClick={upgradeShip} id="upgrade-ship-but" >Expand shipyards (+100 shipsize)</button>
          <label htmlFor="upgrade-ship-but">Cost: x resources</label>
        </div>

      </div>
      <div className="but-row">
        <div className="but-label">
          <button onClick={upgradeHousing} id="upgrade-housing-but">Expand housing (+500)</button>
          <label htmlFor="upgrade-housing-but">Cost: x resources</label>
        </div>
        <div className="but-label">
          <button onClick={upgradeHousing}id="upgrade-jobs-but">Create jobs (+500 jobs)</button>
          <label htmlFor="upgrade-jobs-but">Cost: x resources</label>
        </div>
      </div>
    </main>
  )
}
