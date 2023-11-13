'use client';
import { ChangeEvent, useState } from "react";

export default function Header(){
  const [isDark, setIsDark] = useState(false);

  function ToggleTheme(){
    console.log('toggle theme');
    setIsDark(d=>!d);
  }

  return (
    <header>
      <a href='/' className='title'>
        JS test chamber
      </a>
      <input
      type='button'
      value='TOGGLE THEME(does not work)'
      onClick={e=>ToggleTheme()}
      />
    </header>
  )
}