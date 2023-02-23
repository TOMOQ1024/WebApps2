import './games.scss'
export default function GameCard({
  name,
} : {
  name: string;
}){
  const id = name.replace(/\s/g,'').toLowerCase();
  return (
    <div className='appcard'>
      <a href={`/games/${id}`}>
        <img src={`./app-icons/${id}.png`} alt={name} />
      </a>
      <div>{name}</div>
    </div>
  )
}