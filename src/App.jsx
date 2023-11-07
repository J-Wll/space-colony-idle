import './App.css'
import './LabelledButton'
import { useState, useEffect } from "react";
import LabelledButton from './LabelledButton';

export default function App() {
  // [variable, functionToUpdate] = useState(defaultValue)
  let [day, updateDay] = useState(1);
  let [resources, updateResources] = useState(5000);

  let [shipSize, updateShipSize] = useState(500);
  let [shipSizeCost, updateShipSizeCost] = useState(5000)
  let [shipSizeIncrement, updateShipSizeIncrement] = useState(500)

  let [colonists, updateColonists] = useState(17);
  let [colonistsCost, updateColonistsCost] = useState(1000);
  // Colonists increment is shipsize (in the context of its button)

  let [housing, updateHousing] = useState(1000);
  let [housingCost, updateHousingCost] = useState(1000);
  let [housingIncrement, updateHousingIncrement] = useState(500);

  let [jobs, updateJobs] = useState(100)
  let [jobsCost, updateJobsCost] = useState(1000)
  let [jobsIncrement, updateJobsIncrement] = useState(500)


  // Increases values based on if it can be afforded and if it is below the maximum
  // Parameters in order: Element being changed, function to change it, increase amount, maximium amount (default is no maximum), currency of cost (default is resources), function to update currency of cost, cost amount of the increase
  function validateIncrease(variable, updateFunc, increase, maximum = false, costVariable = resources, costFunc = updateResources, costAmount = 0, costIncrementUpdateFunc = false) {
    if (costAmount <= costVariable) {
      if (maximum === false || variable + increase < maximum) {
        updateFunc(variable => variable + increase);
        costFunc(costVariable => costVariable - costAmount)
        if (costIncrementUpdateFunc != false) {
          costIncrementUpdateFunc(costAmount => costAmount *= 1.01)
        }
      }
      else {
        updateFunc(maximum);
      }
    }
  }

  // Runs every second and is responsible for value changes
  function dailyCycle() {
    updateDay(day + 1);
    validateIncrease(colonists, updateColonists, popIncreaseAmount(), housing);
    updateResources(resourceGain());
  }

  function popIncreaseAmount(display = false) {
    // Rounded down(0.11-1.11 * (colonists/21500) + 0.92)
    // Chances for increases even at very low pops, if random rolls 1.1+, that * 0.92 > 1
    // With 17 colonists its 0.2-1.2 * 0.92085
    // 20000 pop guarentees 1 per cycle, which seems realistic (world pop/births per day)
    let minimum = 0.11;
    let popPer = 21500;
    let baseLine = 0.92
    // Estimated value for display, seems to be roughly accurate. Haven't worked out the correct calculation that accounts for the randomness
    if (display === true) {
      return Math.round(((colonists / popPer) + 0.04) * 100) / 100
    }
    return Math.floor((Math.random() + minimum) * ((colonists / popPer) + baseLine));
  }

  function resourceGain() {
    // Either adds colonists count or job count based on if there are more jobs than colonists. Unemployed colonists cost 0.01 per day.
    return jobs > colonists ? resources + colonists
      : (resources + jobs) + ((jobs - colonists) * 0.01)
  }

  function sendColonists(a) {
    validateIncrease(colonists, updateColonists, shipSize, housing, resources, updateResources, colonistsCost, updateColonistsCost);
  }

  function upgradeJobs() {
    validateIncrease(jobs, updateJobs, jobsIncrement, undefined, resources, updateResources, jobsCost, updateJobsCost);
  }

  function upgradeShip() {
    validateIncrease(shipSize, updateShipSize, shipSizeIncrement, undefined, resources, updateResources, shipSizeCost, updateShipSizeCost);
  }

  function upgradeHousing() {
    validateIncrease(housing, updateHousing, housingIncrement, undefined, resources, updateResources, housingCost, updateHousingCost);
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
          <p className="stats-label border border-2">Daily growth rate: {popIncreaseAmount(true)}</p>
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
          resources={resources} cost={colonistsCost} />

        <LabelledButton onClick={upgradeShip} id="upgrade-ship-but" className=""
          butText={`Expand shipyards (+${shipSizeIncrement})`}
          resources={resources} cost={shipSizeCost} />
      </div>

      <div className="but-row">
        <LabelledButton onClick={upgradeHousing} id="upgrade-housing-but" className=""
          butText={`Expand housing (+500)`}
          resources={resources} cost={housingCost} />

        <LabelledButton onClick={upgradeJobs} id="upgrade-jobs-but" className=""
          butText={`Create jobs (+500)`}
          resources={resources} cost={jobsCost} />
      </div>
    </main>
  )
}

// todo:
// Space Bureau upgrade, adds daily pop growth, maybe a daily resource cost
// After purchasing it once (10000+ cost) it unlocks a new set of upgrades below the current ones

// Resource cost scaling

// Make daily growth rate fully accurate and not just an estimation