"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import '../app.scss'

export default function AppCard({
  name,
} : {
  name: string;
}){
  const [href, setHref] = useState('');

  const id = name.replace(/\s/g,'').toLowerCase();

  useEffect(()=>{
    setHref(window.location.pathname + '/' + id);
  }, [id]);

  return (
    <div className='appcard'>
      <Link href={href}>
        <Image src={`/app-icons/${id}.png`} width={100} height={100} alt={`App icon of ${id}`} />
      </Link>
      <div>{name}</div>
    </div>
  )
}