export default function LabelledButton(props) {
    let buyable;
    if (props.resource >= props.cost){
        buyable = "button-buyable"
    } else {
        buyable = "button-disabled"
    }
    return (
        <div className="but-label">
            <button className = {`${props.className} ${buyable}`} id = {props.id} onClick={props.onClick}>{props.butText}</button>
            <label htmlFor={props.id}>{props.labelText}</label>
        </div>
    )
}


// Previous implementation inside App.jsx
{/* <div className="but-label">
<button id="send-ship-but" onClick={() => sendColonists(1)}>Send a colonist ship (+{colonists + shipSize > housing ? housing - colonists : shipSize})</button>
<label htmlFor="send-ship-but">Cost: 1000 resources</label>
</div> */}