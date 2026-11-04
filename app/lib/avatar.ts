const MAX_SOURCE_BYTES = 8 * 1024 * 1024
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Foto tidak dapat dibaca, coba file lain.'))
    }
    image.src = url
  })
}

/**
 * Foto profil disimpan sebagai data URL agar tidak butuh layanan upload terpisah,
 * makanya dipotong kotak lalu dikecilkan di browser sebelum masuk database.
 */
export async function resizeAvatarToDataUrl(file: File, size = 256, quality = 0.82) {
  if (!SUPPORTED_TYPES.includes(file.type))
    throw new Error('Format foto tidak didukung (pakai JPG, PNG, atau WEBP).')
  if (file.size > MAX_SOURCE_BYTES)
    throw new Error('Ukuran foto maksimal 8 MB.')

  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context)
    throw new Error('Browser tidak mendukung pemrosesan gambar.')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)

  const side = Math.min(image.naturalWidth, image.naturalHeight)
  const offsetX = (image.naturalWidth - side) / 2
  const offsetY = (image.naturalHeight - side) / 2
  context.drawImage(image, offsetX, offsetY, side, side, 0, 0, size, size)

  return canvas.toDataURL('image/jpeg', quality)
}
