// ย่อรูปเป็นสี่เหลี่ยมจัตุรัส (ครอปกลางภาพ) แล้วแปลงเป็น data URL ขนาดเล็ก
// เก็บใน Realtime Database ได้เลย โดยไม่ต้องเปิดใช้ Firebase Storage
export function resizeToDataUrl(file, size = 160) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('ไฟล์ต้องเป็นรูปภาพเท่านั้น'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const side = Math.min(img.width, img.height);
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('อ่านไฟล์รูปภาพไม่ได้'));
    };
    img.src = url;
  });
}
