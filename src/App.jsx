import { useState, useReducer, useRef, useEffect } from "react";
import './css/App.css'
import LabelledButton from './LabelledButton';
import StatsLabel from './StatsLabel';
import ButtonBlock from './ButtonBlock'
import StatsBlock from './StatsBlock.jsx'

export default function App() {
  const initialState = {
    stats: {},
    day: 1,
    resources: 5000,

    shipSize: 500,
    shipCost: 5000,
    shipIncrement: 500,

    colonistCount: 17,
    colonistCost: 1000,

    housingCount: 1000,
    housingCost: 1000,
    housingIncrement: 500,

    jobsCount: 100,
    jobsCost: 1000,
    jobsIncrement: 500,

    constructionQualityValue: 1,
    constructionQualityCost: 20000,
    constructionQualityIncrement: 1,

    resourcesPerWorker: 1,
    costPerUnemployed: 0.01,

    // 100000
    upgrades: {
      "spaceResettlement": { "level": 0, "cost": 100000, "maximum": 1 }
    },
    passiveUpgrades: []
  };

  // get level from state and apply it per upgrade
  const upgrades = [{
    "name": "spaceResettlement",
    "run": function () {
      console.log(popIncrease);
      popIncrease += 1;
      console.log(popIncrease);
    }
  }];

  const [ste, setState] = useState(initialState);

  const saveDlRef = useRef(null);
  const saveUlRef = useRef(null);

  // days/seconds til auto save
  const autoSaveFreq = 10;

  // Triggers dailyCycle every second, passes in dependencies(Ones that change often)
  useEffect(() => {
    const interval = setInterval(() => {
      dailyCycle();
    }, 1000);
    return () => clearInterval(interval);
  }, [ste, ste.colonistCount]);

  function updateOne(name, newValue) {
    setState(ste => ({ ...ste, [name]: newValue }));
  }

  function updateUpgrade(name, newLevel) {
    setState(ste => ({
      ...ste, upgrades: {
        ...ste.upgrades, [name]: {
          ...ste.upgrades[[name]], level: newLevel
        }
      }
    }));
  }

  // to cache changes from multiple locations
  let popIncrease = 0;

  // Runs every second and is responsible for value changes
  function dailyCycle() {
    updateOne("day", (ste.day + 1));
    updateOne("resources", resourceGain());

    // birth rate
    popIncrease += popIncreaseAmount();

    runUpgrades();

    // auto save every x days
    if (ste.day % autoSaveFreq === 0) {
      saveGame();
    }

    validateIncrease("colonistCount", popIncrease, false, ste.housingCount)

    popIncrease = 0;
  }

  function runUpgrades() {
    for (let i in upgrades) {
      // console.log(upgrades[i].name);
      // console.log(ste.upgrades[upgrades[i].name])
      if (ste.upgrades[upgrades[i].name].level > 0) {
        upgrades[i].run();
      }
    }
  }

  function validateIncrease(varName, increase, costAmountName, maximum = false, costName = "resources", increment = false, incrementScale = 1.00, multiplier = 1) {
    // Increases values based on if it can be afforded and if it is below the maximum
    // Parameters in order: Element being changed, function to change it, increase amount, maximium amount (default is no maximum), currency of cost (default is resources), function to set currency of cost, cost amount of the increase
    let costAmount = 0;
    if (costAmountName) {
      costAmount = ste[costAmountName];
    }

    const costVariable = ste[costName];
    const varVal = ste[varName];

    if (costAmount > costVariable) {
      console.log("Can't afford this");
      return;
    }

    // If no maximum or the new amount is less than the maximum
    if (maximum === false || varVal + (increase * multiplier) < maximum) {
      console.log("Increase");
      updateOne(varName, ste[varName] + (increase * multiplier));

      if (costAmount > 0) {
        updateOne(costName, ste[costName] - costAmount);
      }

      // if the increment update isn't false update the increment
      if (increment != false) {
        updateOne(costAmountName, ste[costAmountName] * incrementScale);
      }
    }
    // Otherwise, they have the money so set it to the maximum. (In case the value in 99, with an increase of 2 and a maximum of 100. It should be 100 instead of staying 99)
    else {
      console.log("Maximum");
      updateOne(varName, maximum);
    }
  }

  function validateUpgrade(upgradeName, increase, costAmountName = "cost", maximum = false, costName = "resources", increment = false, incrementScale = 1.00, multiplier = 1) {
    let costAmount = 0;
    if (costAmountName) {
      console.log(upgradeName);
      console.log(ste.upgrades[upgradeName]);
      costAmount = ste.upgrades[upgradeName][costAmountName];
    }

    const costVariable = ste[costName];

    if (costAmount > costVariable) {
      console.log("Can't afford this");
      return;
    }

    console.log(costAmount);
    updateUpgrade(upgradeName, ste.upgrades[upgradeName].level + (increase * multiplier));

    if (costAmount > 0) {
      updateOne(costName, ste[costName] - costAmount);
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
      // return Math.round((Math.random() + minimum) * ((ste.colonistCount / popPer) + baseLine)* 100) /100 ;
      return Math.round(((ste.colonistCount / popPer) + 0.04) * 100) / 100
    }
    return Math.floor((Math.random() + minimum) * ((ste.colonistCount / popPer) + baseLine));
  }

  function resourceGain() {
    // Either adds colonists count or job count based on if there are more jobs than colonists. Unemployed colonists cost 0.01 per day.
    return ste.jobsCount > ste.colonistCount ? ste.resources + (ste.colonistCount * ste.resourcesPerWorker)
      : (ste.resources + (ste.jobsCount * ste.resourcesPerWorker)) + ((ste.jobsCount - ste.colonistCount) * ste.costPerUnemployed)
  }

  function sendColonists() {
    // validateIncrease(colonists, setColonists, ste.shipSize, housing, resources, setResources, colonistsCost, setColonistsCost, 1, 1);
    validateIncrease("colonistCount", ste.shipSize, "colonistCost", ste.housingCount, "resources");
  }

  function upgradeShip() {
    // validateIncrease(shipSize, setShipSize, shipSizeIncrement, undefined, resources, setResources, shipSizeCost, setShipSizeCost, 1.5, 1);
    validateIncrease("shipSize", ste.shipIncrement, "shipCost", undefined, "resources", true, 1.5);
  }

  function upgradeJobs() {
    // validateIncrease(jobs, setJobs, jobsIncrement, undefined, resources, setResources, jobsCost, setJobsCost, undefined, constructionQuality);
    validateIncrease("jobsCount", ste.jobsIncrement, "jobsCost", undefined, "resources", false, undefined, ste.constructionQualityValue);
  }

  function upgradeHousing() {
    // validateIncrease(housing, setHousing, housingIncrement, undefined, resources, setResources, housingCost, setHousingCost, undefined, constructionQuality);
    validateIncrease("housingCount", ste.housingIncrement, "housingCost", undefined, "resources", false, undefined, ste.constructionQualityValue);
  }

  function upgradeConstruction() {
    // validateIncrease(constructionQuality, setConstructionQuality, constructionQualityIncrement, undefined, resources, setResources, constructionQualityCost, setConstructionQualityCost, 1.5, 1);
    validateIncrease("constructionQualityValue", ste.constructionQualityIncrement, "constructionQualityCost", undefined, "resources", true, 1.5);
  }



  function spaceResettlement() {
    // updateUpgrade("spaceResettlement", 1);
    validateUpgrade("spaceResettlement", 1);
  }

  function saveGame() {
    console.log("Game Saved");
    localStorage.setItem("SpaceColonyIdleSave", JSON.stringify(ste));
  }

  function loadGame() {
    console.log("Game Loaded");
    const save = JSON.parse(localStorage.getItem("SpaceColonyIdleSave"));
    setState(save);
  }

  function saveBackup() {
    console.log("Backup saved");
    // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ste));
    const dlAnchorElem = saveDlRef.current;
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "SpaceColonyIdleSave.json");
    dlAnchorElem.click();

  }

  // triggers the file input
  function loadBackup() {
    console.log("Backup loaded");
    saveUlRef.current.click();
  }

  // triggered by the file input, loads the save
  function loadBackupSave(event) {
    const file = event.target.files[0];
    console.log(file);

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = JSON.parse(reader.result);
      console.log("File content:", fileContent);
      setState(fileContent);
    };
    reader.readAsText(file);
    // so that uploading the same file twice still works. doesn't trigger the onchange otherwise
    saveUlRef.current.value = null

  }

  function resetGame() {
    setState(initialState);
  }

  function jobLabel() {
    if (ste.jobsCount > ste.colonistCount) {
      return ["green-text", `${ste.jobsCount - ste.colonistCount} Free jobs`]
    }
    else if (ste.colonistCount > ste.jobsCount) {
      return ["red-text", `${ste.colonistCount - ste.jobsCount} Unemployed`]
    }
    else {
      return ["green-text", "Job demand met"]
    }
  }

  function isResGain() {
    return resourceGain() - ste.resources > 0 ? "green-text" : "red-text"
  }

  // values for stats/buttons
  const [jobLabelClass, textForJobLabel] = jobLabel();
  const colonistIncrease = ste.colonistCount + ste.shipSize > ste.housingCount ? ste.housingCount - ste.colonistCount : ste.shipSize;
  const housingIncreaseMul = ste.housingIncrement * ste.constructionQualityValue;
  const jobsIncreaseMul = ste.jobsIncrement * ste.constructionQualityValue;
  const spaceResettlementActive = ste.upgrades.spaceResettlement.level >= ste.upgrades.spaceResettlement.maximum;

  return (
    <main>
      <div className="column">
        <p className="fs-1r">Day: {ste.day}</p>
        <StatsBlock
          components={[
            <StatsLabel key="1" className={`bold`} labelText={`${ste.colonistCount} colonists`} tooltipText={`Colonists require housing and either produce resources or cost a small amount depending on employement`} />,
            <StatsLabel key="2" className={`bold`} labelText={`Resources: ${ste.resources.toFixed(2)}`} tooltipText={`Used to upgrade most game features${""}`} />,
            <StatsLabel key="3" className={``} labelText={`Housing space: ${ste.housingCount}`} tooltipText={`Required to house colonists${""}`} />,
            <StatsLabel key="4" className={``} labelText={`Jobs: ${ste.jobsCount}`} tooltipText={`Jobs provides resources when colonists fill them${""}`} />,
            <StatsLabel key="5" className={``} labelText={`Daily growth rate: ${popIncreaseAmount(true)}`} tooltipText={`Approximate population gain per day${""}`} />,
            <StatsLabel key="6" className={``} labelText={`Ship size: ${ste.shipSize}`} tooltipText={`Amount of colonists gained per colony ship sent${""}`} />,
            <StatsLabel key="7" className={`${jobLabelClass}`} labelText={`${textForJobLabel}`} tooltipText={`Amount of free jobs/unemployed colonists${""}`} />,
            <StatsLabel key="8" className={`${isResGain()}`} labelText={`Resource gain: ${(resourceGain() - ste.resources).toFixed(2)}`} tooltipText={`Amount of resources gained per day${""}`} />,
            <StatsLabel key="9" className={``} labelText={`Construction quality: ${ste.constructionQualityValue}`} tooltipText={`Mulitplier to certain upgrades${""}`} />
          ]}
        />

        <div className='button-block mt-2r'>
          <div className="display-row">
            <LabelledButton onClick={sendColonists} id="send-ship-but" className=""
              butText={`Send a colonist ship (+${colonistIncrease})`}
              resources={ste.resources} cost={ste.colonistCost} space={ste.housingCount - ste.colonistCount} tooltipText={`Increases the amount of colonists by ${colonistIncrease}`} />

            <LabelledButton onClick={upgradeShip} id="upgrade-ship-but" className=""
              butText={`Expand shipyards (+${ste.shipIncrement})`}
              resources={ste.resources} cost={ste.shipCost} tooltipText={`Increases the amount of colonists per ship by ${ste.shipIncrement}`} />
          </div>

          <div className="display-row">
            <LabelledButton onClick={upgradeHousing} id="upgrade-housing-but" className=""
              butText={`Expand housing (+${housingIncreaseMul})`}
              resources={ste.resources} cost={ste.housingCost} tooltipText={`Adds ${housingIncreaseMul} housing space for colonists`} />

            <LabelledButton onClick={upgradeJobs} id="upgrade-jobs-but" className=""
              butText={`Create jobs (+${jobsIncreaseMul})`}
              resources={ste.resources} cost={ste.jobsCost} tooltipText={`Adds ${jobsIncreaseMul} jobs for colonists, each worker produces ${ste.resourcesPerWorker} ${ste.resourcesPerWorker == 1 ? "resource" : "resources"} per day, unemployed colonists have a cost of ${ste.costPerUnemployed} resources daily`} />
          </div>

          <div className="display-row">
            <LabelledButton onClick={upgradeConstruction} id="upgrade-construction-but" className=""
              butText={`Upgrade construction (+${ste.constructionQualityIncrement}*)`}
              resources={ste.resources} cost={ste.constructionQualityCost} tooltipText={`Adds ${ste.constructionQualityIncrement}x effectiveness to the amount of jobs and housing made per upgrade`} />

            {spaceResettlementActive ? null :
              <LabelledButton onClick={spaceResettlement} id="" className=""
                butText={`Space Resettlement Bureau`}
                resources={ste.resources} cost={ste.upgrades.spaceResettlement.cost} tooltipText={`Adds one colonist per day, one off purchase that unlocks a new set of upgrades`} />
            }
          </div>
        </div>

        <div className='button-block mt-2r'>
          <div className="display-row">
            <LabelledButton onClick={saveGame} id="save-game-but" className="button-neutral"
              butText={`Save Game`} tooltipText={`Saves the game`} />

            <LabelledButton onClick={loadGame} id="load-game-but" className="button-neutral"
              butText={`Load Game`} tooltipText={`Loads your save game`} />
          </div>

          <div className="display-row">
            <LabelledButton onClick={saveBackup} id="save-backup-but" className="button-neutral"
              butText={`Save Backup File`} tooltipText={`Saves a local JSON file for the game save`} />

            <LabelledButton onClick={loadBackup} id="load-backup-but" className="button-neutral"
              butText={`Load from Backup File`} tooltipText={`Loads a local JSON file for the game save`} />
          </div>

          <div className="display-row">
            <LabelledButton onClick={resetGame} id="reset-game-but" className="button-neutral"
              butText={`Reset Game`} tooltipText={`Resets your save game`} />
          </div>

        </div>
      </div>

      {spaceResettlementActive ?
        <div className="column afterSpaceResUpgrades">
          <div className='button-block mt-2r'>
            <div className="display-row">
              <LabelledButton onClick={sendColonists} id="send-ship-but" className=""
                butText={`Send a colonist ship (+${colonistIncrease})`}
                resources={ste.resources} cost={ste.colonistCost} space={ste.housingCount - ste.colonistCount} tooltipText={`Increases the amount of colonists by ${colonistIncrease}`} />

              <LabelledButton onClick={upgradeShip} id="upgrade-ship-but" className=""
                butText={`Expand shipyards (+${ste.shipIncrement})`}
                resources={ste.resources} cost={ste.shipCost} tooltipText={`Increases the amount of colonists per ship by ${ste.shipIncrement}`} />
            </div>

          </div>
        </div>
        : null}

      {/* invisible helpers for downloading and uploading */}
      <a id="downloadAnchorElem" style={{ display: "none" }} ref={saveDlRef}></a>
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={loadBackupSave}
        ref={saveUlRef}
      />

    </main>
  )
}

// todo:
// Space Bureau upgrade, adds daily pop growth, maybe a daily resource cost
// After purchasing it once (10000+ cost) it unlocks a new set of upgrades below the current ones
// Space elevator
// Mass gun (what are they called?)
// Construction incentives (Population starts building houses and jobs)
// Reproduction incentives (Increase birth rate, in exchange for less money per pop? like bc it costs, could be a toggle after purchasing)

// Resource cost scaling (Capacity for this implemented, but not really used yet)

// Make daily growth rate fully accurate and not just an estimation

// Remove bootstrap (Not used enough to have it)

// New upgrade that improves both housing and jobs increment (Improve construction capabilities or something)

// Save/load buttons (Each stateful value pushed/retrived to/from local storage?)
