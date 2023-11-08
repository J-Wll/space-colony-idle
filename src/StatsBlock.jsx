export default function StatsBlock(props) {
    let rowComponents = [];
    props.components.forEach((comp, index) => { 
        if ((index+1) % 2 != 0 && (index+1 < props.components.length)){
            rowComponents.push([comp, props.components[index+1]])
        } else if (props.components.length % 2 != 0 && index+1 === props.components.length){
            rowComponents.push([comp])
        }
     }) 

     rowComponents = rowComponents.map((set, index)=><div className="stats-row">{set}</div>)

    return (
        <section className="stats-block">
            {rowComponents}
        </section>
    )
}
