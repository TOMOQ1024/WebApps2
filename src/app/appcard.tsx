"use client";
import { useEffect, useState } from 'react';
import './app.scss'

export default function AppCard({
  name,
} : {
  name: string;
}){
  const [href, setHref] = useState('');

  const id = name.replace(/\s/g,'').toLowerCase();

  useEffect(()=>{
    setHref(window.location.pathname + '/' + id);
  }, []);

  return (
    <div className='appcard'>
      <a href={href}>
        <img src={`/app-icons/${id}.png`} alt={name} />
      </a>
      <div>{name}</div>
    </div>
  )
}