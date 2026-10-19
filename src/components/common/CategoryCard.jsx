import {useNavigate} from 'react-router-dom';
export default function CategoryCard({category}){const nav=useNavigate();return <button className="category-card" onClick={()=>nav(`/concerts?category=${category.category_id}`)}><span>{({Pop:'🎤',Rock:'🎸',Acoustic:'🎼',Indie:'🎧',Ballad:'🎹'})[category.name_en]||'🎵'}</span><strong>{category.name_th}</strong><small>{category.name_en}</small></button>}
