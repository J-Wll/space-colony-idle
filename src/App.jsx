import { useState, useReducer, useEffect } from "react";
import './css/App.css'
import LabelledButton from './LabelledButton';
import StatsLabel from './StatsLabel';
import ButtonBlock from './ButtonBlock'
import StatsBlock from './StatsBlock.jsx'

export default function App() {
  // TODO: Worth doing a reducer here?
  // [variable, functionToUpdate] = useState(defaultValue)
  function reducer(state, action) {
    switch (action.type) {
      case "DAY":
        return { ...state, day: action.value };
      case "SHIP":
        return { ...state, resources: action.values.resourceCost ? action.values.resourceCost : state.resources, ship: { size: action.values.variableIncrease ? action.values.variableIncrease : state.ship.size, cost: action.values.costChange ? action.values.costChange : state.ship.cost, increment: action.values.incrementChange ? action.values.incrementChange : state.ship.increment } }
      default: return state;
    }
  };

  const initialState = {
    stats: {},
    day: 1,
    resources: 5000,
    ship: {
      size: 500,
      cost: 5000,
      increment: 500,
    },
    colonists: {
      count: 17,
      cost: 1000,
    },
    housing: {
      count: 1000,
      cost: 1000,
      increment: 500,
    },
    jobs: {
      count: 100,
      cost: 1000,
      increment: 500,
    },
    constructionQuality: {
      value: 1,
      cost: 20000,
      increment: 1,
    },
    resourcesPerWorker: 1,
    costPerUnemployed: 0.01,
  };


  const [state, dispatch] = useReducer(reducer, initialState);

  let [day, setDay] = useState(1);
  let [resources, setResources] = useState(5000);

  let [shipSize, setShipSize] = useState(500);
  let [shipSizeCost, setShipSizeCost] = useState(5000)
  let [shipSizeIncrement, setShipSizeIncrement] = useState(500)

  let [colonists, setColonists] = useState(17);
  let [colonistsCost, setColonistsCost] = useState(1000);
  // Colonists increment is shipsize (in the context of its button)

  let [housing, setHousing] = useState(1000);
  let [housingCost, setHousingCost] = useState(1000);
  let [housingIncrement, setHousingIncrement] = useState(500);

  let [jobs, setJobs] = useState(100)
  let [jobsCost, setJobsCost] = useState(1000)
  let [jobsIncrement, setJobsIncrement] = useState(500)

  let [constructionQuality, setConstructionQuality] = useState(1)
  let [constructionQualityCost, setConstructionQualityCost] = useState(20000)
  let [constructionQualityIncrement, setConstructionQualityIncrement] = useState(1)

  let [resourcesPerWorker, setResourcesPerWorker] = useState(1);
  let [costPerUnemployed, setCostPerUnemployed] = useState(0.01);

  // Triggers dailyCycle every second, passes in dependencies(Ones that change often)
  useEffect(() => {
    const interval = setInterval(() => {
      dailyCycle();
    }, 1000);
    return () => clearInterval(interval);
  }, [colonists, day, state.day, jobs, resources]);

  // Runs every second and is responsible for value changes
  function dailyCycle() {
    // setDay(day + 1);
    dispatch({ type: "DAY", value: state.day + 1 })
    validateIncrease(colonists, setColonists, popIncreaseAmount(), housing);
    setResources(resourceGain());
  }
  console.log(state);

  // Increases values based on if it can be afforded and if it is below the maximum
  // Parameters in order: Element being changed, function to change it, increase amount, maximium amount (default is no maximum), currency of cost (default is resources), function to set currency of cost, cost amount of the increase
  function validateIncrease(variable, setFunc, increase, maximum = false, costVariable = resources, costFunc = setResources, costAmount = 0, costIncrementUpdateFunc = false, incrementScale = 1.00, multiplier = 1) {
    if (costAmount <= costVariable) {
      if (maximum === false || variable + increase < maximum) {
        // Impact to resources, increase of the variable, change of the cost amount
        setFunc(variable => variable + (increase * multiplier));
        costFunc(costVariable => costVariable - costAmount)
        if (costIncrementUpdateFunc != false) {
          costIncrementUpdateFunc(costAmount => costAmount *= incrementScale)
        }
      }
      else {
        setFunc(maximum);
      }
    }
  }

  function validateIncreaseRed(target, variable, increase, maximum = false, costVariable = resources, costAmount = 0, incrementScale = 1.00, multiplier = 1) {
    if (costAmount <= costVariable) {
      if (maximum === false || variable + increase < maximum) {
        // Impact to resources, increase of the variable, change of the cost amount
        dispatch({
          type: target, values: { resourceCost: costVariable - costAmount, variableIncrease: variable + (increase * multiplier), costChange: costAmount *= incrementScale }
        })
        console.log(state);
      }
      else {
        dispatch({ type: target, values: { variableIncrease: maximum } })
        console.log(state);
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
    validateIncrease(colonists, setColonists, state.ship.size, housing, resources, setResources, colonistsCost, setColonistsCost, 1, 1);
  }

  function upgradeShip() {
    // validateIncrease(shipSize, setShipSize, shipSizeIncrement, undefined, resources, setResources, shipSizeCost, setShipSizeCost, 1.5, 1);
    validateIncreaseRed("SHIP", state.ship.size, state.ship.increment, undefined, resources, state.ship.cost, 1.5, 1);
  }

  function upgradeJobs() {
    validateIncrease(jobs, setJobs, jobsIncrement, undefined, resources, setResources, jobsCost, setJobsCost, undefined, constructionQuality);
  }

  function upgradeHousing() {
    validateIncrease(housing, setHousing, housingIncrement, undefined, resources, setResources, housingCost, setHousingCost, undefined, constructionQuality);
  }

  function upgradeConstruction() {
    validateIncrease(constructionQuality, setConstructionQuality, constructionQualityIncrement, undefined, resources, setResources, constructionQualityCost, setConstructionQualityCost, 1.5, 1);
  }

  function spaceResettlement() {

  }

  function saveGame() {

  }

  function loadGame() {

  }


  function resetGame() { }

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
  let colonistIncrease = colonists + state.ship.size > housing ? housing - colonists : state.ship.size;
  let housingIncreaseMul = housingIncrement * constructionQuality;
  let jobsIncreaseMul = jobsIncrement * constructionQuality;
  return (
    <main>
      <p className="fs-1r">Day: {state.day}</p>
      <StatsBlock
        components={[
          <StatsLabel key="1" className={`bold`} labelText={`${colonists} colonists`} tooltipText={`Colonists require housing and either produce resources or cost a small amount depending on employement`} />,
          <StatsLabel key="2" className={`bold`} labelText={`Resources: ${resources.toFixed(2)}`} tooltipText={`Used to upgrade most game features${""}`} />,
          <StatsLabel key="3" className={``} labelText={`Housing space: ${housing}`} tooltipText={`Required to house colonists${""}`} />,
          <StatsLabel key="4" className={``} labelText={`Jobs: ${jobs}`} tooltipText={`Jobs provides resources when colonists fill them${""}`} />,
          <StatsLabel key="5" className={``} labelText={`Daily growth rate: ${popIncreaseAmount(true)}`} tooltipText={`Approximate population gain per day${""}`} />,
          <StatsLabel key="6" className={``} labelText={`Ship size: ${state.ship.size}`} tooltipText={`Amount of colonists gained per colony ship sent${""}`} />,
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
            butText={`Expand shipyards (+${state.ship.increment})`}
            resources={resources} cost={state.ship.cost} tooltipText={`Increases the amount of colonists per ship by ${state.ship.increment}`} />
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

          <LabelledButton onClick={spaceResettlement} id="" className=""
            butText={`TODO Space Resettlement Bureau`}
            resources={resources} cost={100000} tooltipText={`Adds daily colonists, one off purchase that unlocks a new set of upgrades`} />
        </div>
      </div>

      <div className='button-block mt-2r'>
        <div className="display-row">
          <LabelledButton onClick={saveGame} id="save-game-but" className="button-neutral"
            butText={`TODO Save game`} tooltipText={`Saves the game`} />

          <LabelledButton onClick={loadGame} id="load-game-but" className="button-neutral"
            butText={`TODO Load game`} tooltipText={`Loads your save game`} />
        </div>

        <div className="display-row">
          <LabelledButton onClick={resetGame} id="reset-game-but" className="button-neutral"
            butText={`TODO Reset game`} tooltipText={`Resets your save game`} />
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
