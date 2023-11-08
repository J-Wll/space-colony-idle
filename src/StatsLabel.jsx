import "./css/StatsAndButtons.css"

import ToolTip from "./ToolTip"
export default function StatsLabel(props) {
    return (
        <div className="tooltip stats-label-div">
            <p className={`stats-label border ${props.className}`}>{props.labelText}</p>
            <ToolTip tooltipText={props.tooltipText} />
        </div>
    )
}

// old way
// <p className="stats-label border border-2 bold">{colonists} colonists</p>
