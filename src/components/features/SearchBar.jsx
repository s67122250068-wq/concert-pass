import {useState} from 'react';
export default function SearchBar({onSearch,initialValue=''}){const [v,setV]=useState(initialValue);return <form className="search" onSubmit={e=>{e.preventDefault();onSearch?.(v)}}><input value={v} onChange={e=>setV(e.target.value)} placeholder="ค้นหาชื่อคอนเสิร์ต ศิลปิน หรือสถานที่..."/><button>ค้นหา</button></form>}
