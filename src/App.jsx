import './App.css'
import './LabelledButton'
import { useState, useEffect } from "react";
import LabelledButton from './LabelledButton';

export default function App() {
  // [variable, functionToUpdate] = useState(defaultValue)
  let [colonists, updateColonists] = useState(17);
  let [shipSize, updateShipSize] = useState(500);
  let [housing, updateHousing] = useState(1000);
  let [day, updateDay] = useState(1);
  let [resources, updateResources] = useState(5000);
  let [jobs, updateJobs] = useState(100)

  // Increases values based on if it can be afforded and if it is below the maximum
  // Parameters in order: Element being changed, function to change it, increase amount, maximium amount (default is no maximum), currency of cost (default is resources), function to update currency of cost, cost amount of the increase
  function validateIncrease(variable, updateFunc, increase, maximum = false, costVariable = resources, costFunc = updateResources, costAmount = 0) {
    if (costAmount <= costVariable) {
      if (maximum === false || variable + increase < maximum) {
        updateFunc(variable => variable + increase);
        costFunc(costVariable => costVariable - costAmount)
      }
      else {
        updateFunc(maximum);
      }
    }
  }

  function dailyCycle() {
    // Rounded down(0.2-1.2 * (colonists/20000) + 0.92)
    // Chances for increases even at very low pops, if random rolls 1.1+, that * 0.92 > 1
    // With 17 colonists its 0.2-1.2 * 0.92085
    // 20000 pop guarentees 1 per cycle, which i think is realistic (world pop/births per day)
    let increase = Math.floor((Math.random() + 0.11) * ((colonists / 21500) + 0.92));
    updateDay(day + 1);
    validateIncrease(colonists, updateColonists, increase, housing);
    updateResources(resourceGain());
  }

  function resourceGain() {
    // Either adds colonists count or job count based on if there are more jobs than colonists. Unemployed colonists cost 0.01 per day.
    return jobs > colonists ? resources + colonists
      : (resources + jobs) + ((jobs - colonists) * 0.01)
  }

  function sendColonists(a) {
    validateIncrease(colonists, updateColonists, shipSize, housing, resources, updateResources, 1000);
  }

  function upgradeJobs() {
    // updateJobs(jobs => jobs + 500)
    validateIncrease(jobs, updateJobs, 500, undefined, resources, updateResources, 1000);
  }

  function upgradeShip() {
    // updateShipSize(shipSize => shipSize + 100)
    validateIncrease(shipSize, updateShipSize, 100, undefined, resources, updateResources, 1000);
  }

  function upgradeHousing() {
    // updateHousing(housing => housing + 500);
    validateIncrease(housing, updateHousing, 500, undefined, resources, updateResources, 1000);
  }

  function buttonDisable() {

  }

  function jobLabel() {
    if (jobs > colonists) {
      return <p className="stats-label border border-2 green-text">{[jobs - colonists, " Free jobs"]}</p>
    }
    else if (colonists > jobs) {
      return <p className="stats-label border border-2 red-text">{[colonists - jobs, " Unemployed"]}</p>
    }
    else {
      return <p className="stats-label border border-2 green-text">{"Job demand met"}</p>
    }
  }

  // console.log("before use ef", colonists)
  useEffect(() => {
    const interval = setInterval(() => {
      // console.log("use ef", colonists)
      dailyCycle();
    }, 1000);
    return () => clearInterval(interval);
  }, [colonists, day, jobs, resources]);

  let resGain = resourceGain() - resources;
  let resColour = resGain > 0 ? "green-text" : "red-text"

  return (
    <main>
      <p className="fs-6">Day: {day}</p>
      <section className="stats-block">
        <div className="stats-row">
          <p className="stats-label border border-2 bold">{colonists} colonists</p>
          <p className="stats-label border border-2 bold">Resources: {resources.toFixed(2)}</p>
        </div>
        <div className="stats-row">
          <p className="stats-label border border-2">Housing space: {housing}</p>
          <p className="stats-label border border-2">Jobs: {jobs}</p>
        </div>
        <div className="stats-row">
          <p className="stats-label border border-2">Daily growth rate: {Math.round(((colonists / 21500) + 0.04) * 100) / 100}</p>
          <p className="stats-label border border-2">Ship size: {shipSize}</p>
        </div>
        <div className="stats-row">
          {/* <p className="stats-label border border-2">Colonist efficiency: {jobs/colonists}</p> */}
          {/* <p className="stats-label border border-2">{jobLabel()}</p> */}
          {jobLabel()}
          <p className={`stats-label border border-2 ${resColour}`}>Resource gain: {(resourceGain() - resources).toFixed(2)}</p>
        </div>
      </section>

      <div className="but-row mt-2">
        <LabelledButton onClick={() => sendColonists(1)} id="send-ship-but" className=""
          butText={`Send a colonist ship (+${colonists + shipSize > housing ? housing - colonists : shipSize})`}
          labelText={`Cost: 1000 resources`} />

        <LabelledButton onClick={upgradeShip} id="upgrade-ship-but" className=""
          butText={`Expand shipyards (+100)`} labelText={`Cost: 1000 resources`} />
      </div>

      <div className="but-row">
        <LabelledButton onClick={upgradeHousing} id="upgrade-housing-but" className=""
          butText={`Expand housing (+500)`} labelText={`Cost: 1000 resources`} />

        <LabelledButton onClick={upgradeJobs}  id="upgrade-jobs-but" className=""
        butText={`Create jobs (+500 jobs)`} labelText={`Cost: 1000 resources`}/>
      </div>
    </main>
  )
}

// todo:
// Space Bureau upgrade, adds daily pop growth, maybe a daily resource cost
// After purchasing it once (10000+ cost) it unlocks a new set of upgrades below the current ones

// Resource cost scaling