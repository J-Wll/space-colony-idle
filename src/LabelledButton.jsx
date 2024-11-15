import ToolTip from "./ToolTip";
import "./css/StatsAndButtons.css"

export default function LabelledButton(props) {
    if (props.noRender === true) {
        return (<></>)
    }

    let buyable;
    buyable = props.resources >= props.cost ? "button-buyable"
        : "button-disabled"
    if (props.space === 0) {
        buyable = "button-disabled"
    }

    let Clabel = props.cost != undefined ? <label htmlFor={props.id}>Cost: {props.cost.toFixed(2)} resources</label> : <></>
    // let Clabel = "ifoj"

    return (
        <div className="but-label tooltip">
            <button className={`${buyable} ${props.className} `} id={props.id} onClick={props.onClick}>{props.butText}</button>
            {Clabel}
            {/* <label htmlFor={props.id}>Cost: {props.cost.toFixed(2)} resources</label> */}
            <ToolTip tooltipText={props.tooltipText} />
            {/* <span className="tooltip-body"><p className="tooltip-text">{props.tooltipText}</p></span> */}
        </div>
    )
}


// Previous implementation inside App.jsx
{/* <div className="but-label">
<button id="send-ship-but" onClick={() => sendColonists(1)}>Send a colonist ship (+{colonists + shipSize > housing ? housing - colonists : shipSize})</button>
<label htmlFor="send-ship-but">Cost: 1000 resources</label>
</div> */}