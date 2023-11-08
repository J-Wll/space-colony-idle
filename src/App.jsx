import { useState, useEffect } from "react";
import './css/App.css'
import LabelledButton from './LabelledButton';
import StatsLabel from './StatsLabel';
import ButtonBlock from './ButtonBlock'
import StatsBlock from './StatsBlock.jsx'

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

  let [constructionQuality, updateConstructionQuality] = useState(1)
  let [constructionQualityCost, updateConstructionQualityCost] = useState(20000)
  let [constructionQualityIncrement, updateConstructionQualityIncrement] = useState(1)

  let [resourcesPerWorker, updateResourcesPerWorker] = useState(1);
  let [costPerUnemployed, updateCostPerUnemployed] = useState(0.01);

  // Triggers dailyCycle every second, passes in dependencies(Ones that change often)
  useEffect(() => {
    const interval = setInterval(() => {
      dailyCycle();
    }, 1000);
    return () => clearInterval(interval);
  }, [colonists, day, jobs, resources]);

  // Runs every second and is responsible for value changes
  function dailyCycle() {
    updateDay(day + 1);
    validateIncrease(colonists, updateColonists, popIncreaseAmount(), housing);
    updateResources(resourceGain());
  }

  // Increases values based on if it can be afforded and if it is below the maximum
  // Parameters in order: Element being changed, function to change it, increase amount, maximium amount (default is no maximum), currency of cost (default is resources), function to update currency of cost, cost amount of the increase
  function validateIncrease(variable, updateFunc, increase, maximum = false, costVariable = resources, costFunc = updateResources, costAmount = 0, costIncrementUpdateFunc = false, incrementScale = 1.00, multiplier = 1) {
    if (costAmount <= costVariable) {
      if (maximum === false || variable + increase < maximum) {
        updateFunc(variable => variable + (increase * multiplier));
        costFunc(costVariable => costVariable - costAmount)
        if (costIncrementUpdateFunc != false) {
          costIncrementUpdateFunc(costAmount => costAmount *= incrementScale)
        }
      }
      else {
        updateFunc(maximum);
      }
    }
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
    return jobs > colonists ? resources + (colonists * resourcesPerWorker)
      : (resources + (jobs * resourcesPerWorker)) + ((jobs - colonists) * costPerUnemployed)
  }

  function sendColonists(a) {
    validateIncrease(colonists, updateColonists, shipSize, housing, resources, updateResources, colonistsCost, updateColonistsCost, 1, 1);
  }

  function upgradeShip() {
    validateIncrease(shipSize, updateShipSize, shipSizeIncrement, undefined, resources, updateResources, shipSizeCost, updateShipSizeCost, 1.5, 1);
  }

  function upgradeJobs() {
    validateIncrease(jobs, updateJobs, jobsIncrement, undefined, resources, updateResources, jobsCost, updateJobsCost, undefined, constructionQuality);
  }

  function upgradeHousing() {
    validateIncrease(housing, updateHousing, housingIncrement, undefined, resources, updateResources, housingCost, updateHousingCost, undefined, constructionQuality);
  }

  function upgradeConstruction() {
    validateIncrease(constructionQuality, updateConstructionQuality, constructionQualityIncrement, undefined, resources, updateResources, constructionQualityCost, updateConstructionQualityCost, 1.5, 1);
  }

  function saveGame() {

  }

  function loadGame() {

  }

  function jobLabel() {
    if (jobs > colonists) {
      return ["green-text", `${jobs - colonists} Free jobs`]
    }
    else if (colonists > jobs) {
      return ["red-text", `${colonists - jobs} Unemployed`]
    }
    else {
      return ["green-text", "Job demand met"]
    }
  }

  function isResGain() {
    return resourceGain() - resources > 0 ? "green-text" : "red-text"
  }

  // values for stats/buttons
  let [jobLabelClass, textForJobLabel] = jobLabel();
  let colonistIncrease = colonists + shipSize > housing ? housing - colonists : shipSize;
  let housingIncreaseMul = housingIncrement * constructionQuality;
  let jobsIncreaseMul = jobsIncrement * constructionQuality;
  return (
    <main>
      <p className="fs-1r">Day: {day}</p>
      <StatsBlock
        components={[
          <StatsLabel key="1" className={`bold`} labelText={`${colonists} colonists`} tooltipText={`Colonists require housing and either produce resources or cost a small amount depending on employement`} />,
          <StatsLabel key="2" className={`bold`} labelText={`Resources: ${resources.toFixed(2)}`} tooltipText={`Used to upgrade most game features${""}`} />,
          <StatsLabel key="3" className={``} labelText={`Housing space: ${housing}`} tooltipText={`Required to house colonists${""}`} />,
          <StatsLabel key="4" className={``} labelText={`Jobs: ${jobs}`} tooltipText={`Jobs provides resources when colonists fill them${""}`} />,
          <StatsLabel key="5" className={``} labelText={`Daily growth rate: ${popIncreaseAmount(true)}`} tooltipText={`Approximate population gain per day${""}`} />,
          <StatsLabel key="6" className={``} labelText={`Ship size: ${shipSize}`} tooltipText={`Amount of colonists gained per colony ship sent${""}`} />,
          <StatsLabel key="7" className={`${jobLabelClass}`} labelText={`${textForJobLabel}`} tooltipText={`Amount of free jobs/unemployed colonists${""}`} />,
          <StatsLabel key="8" className={`${isResGain()}`} labelText={`Resource gain: ${(resourceGain() - resources).toFixed(2)}`} tooltipText={`Amount of resources gained per day${""}`} />,
          <StatsLabel key="9" className={``} labelText={`Construction quality: ${constructionQuality}`} tooltipText={`Mulitplier to certain upgrades${""}`} />
        ]}
      />

      <div className='button-block mt-2r'>
        <div className="display-row">
          <LabelledButton onClick={() => sendColonists(1)} id="send-ship-but" className=""
            butText={`Send a colonist ship (+${colonistIncrease})`}
            resources={resources} cost={colonistsCost} space={housing - colonists} tooltipText={`Increases the amount of colonists by ${colonistIncrease}`} />

          <LabelledButton onClick={upgradeShip} id="upgrade-ship-but" className=""
            butText={`Expand shipyards (+${shipSizeIncrement})`}
            resources={resources} cost={shipSizeCost} tooltipText={`Increases the amount of colonists per ship by ${shipSizeIncrement}`} />
        </div>

        <div className="display-row">
          <LabelledButton onClick={upgradeHousing} id="upgrade-housing-but" className=""
            butText={`Expand housing (+${housingIncreaseMul})`}
            resources={resources} cost={housingCost} tooltipText={`Adds ${housingIncreaseMul} housing space for colonists`} />

          <LabelledButton onClick={upgradeJobs} id="upgrade-jobs-but" className=""
            butText={`Create jobs (+${jobsIncreaseMul})`}
            resources={resources} cost={jobsCost} tooltipText={`Adds ${jobsIncreaseMul} jobs for colonists, each worker produces ${resourcesPerWorker} ${resourcesPerWorker == 1 ? "resource" : "resources"} per day, unemployed colonists have a cost of ${costPerUnemployed} resources daily`} />
        </div>

        <div className="display-row">
          <LabelledButton onClick={upgradeConstruction} id="upgrade-construction-but" className=""
            butText={`Upgrade construction (+${constructionQualityIncrement}*)`}
            resources={resources} cost={constructionQualityCost} tooltipText={`Adds ${constructionQualityIncrement}x effectiveness to the amount of jobs and housing made per upgrade`} />

          <LabelledButton onClick={""} id="" className=""
            butText={`TODO Space Tourism Bureau`}
            resources={resources} cost={100000} tooltipText={`Adds daily colonists, one off purchase that unlocks a new set of upgrades`} />
        </div>
      </div>

      <div className='button-block mt-2r'>
        <div className="display-row">
          <LabelledButton onClick={saveGame} id="save-game-but" className="button-neutral"
            butText={`TODO Save game`} tooltipText={`Saves the game`} />

          <LabelledButton onClick={loadGame} id="load-game-but" className="button-neutral"
            butText={`TODO Load game`} tooltipText={`Loads the game`} />
        </div>
      </div>
    </main>
  )
}

// todo:
// Space Bureau upgrade, adds daily pop growth, maybe a daily resource cost
// After purchasing it once (10000+ cost) it unlocks a new set of upgrades below the current ones

// Resource cost scaling (Capacity for this implemented, but not really used yet)

// Make daily growth rate fully accurate and not just an estimation

// Remove bootstrap (Not used enough to have it)

// New upgrade that improves both housing and jobs increment (Improve construction capabilities or something)

// Save/load buttons (Each stateful value pushed/retrived to/from local storage?)
