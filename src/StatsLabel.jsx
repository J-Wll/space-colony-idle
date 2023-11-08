export default function StatsLabel(props){
    return(
        <p className={`stats-label border ${props.className}`}>{props.labelText}</p>
    )
}

// old way 
// <p className="stats-label border border-2 bold">{colonists} colonists</p>
