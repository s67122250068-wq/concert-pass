// รูปโปรไฟล์ ถ้าไม่มีรูปแสดงตัวอักษรแรกของชื่อ
export default function Avatar({ photo, name = '', size = 34 }) {
  const style = { width: size, height: size, fontSize: size * 0.45 };
  return photo ? (
    <img className="avatar" src={photo} alt={name} style={style} />
  ) : (
    <span className="avatar avatar-text" style={style} aria-hidden="true">
      {(name.trim()[0] || '?').toUpperCase()}
    </span>
  );
}
