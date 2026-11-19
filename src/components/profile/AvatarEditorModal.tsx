import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Trash2, X, ZoomIn } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { removeAvatar, updateDisplayName, uploadAvatar } from '../../services/profileApi'

type AvatarEditorModalProps = {
  open: boolean
  onClose: () => void
  currentName: string
  currentAvatarUrl: string | null
  onSaved: () => Promise<void> | void
}

const OUTPUT_SIZE = 320
const STAGE_SIZE = 224

export function AvatarEditorModal({
  open,
  onClose,
  currentName,
  currentAvatarUrl,
  onSaved,
}: AvatarEditorModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState(currentName)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0, ox: 0, oy: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageNatural, setImageNatural] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!open) return
    setName(currentName)
    setPreviewUrl(null)
    setScale(1)
    setOffset({ x: 0, y: 0 })
    setError(null)
    setImageNatural({ w: 0, h: 0 })
  }, [open, currentName])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displaySize = useMemo(() => {
    if (!imageNatural.w || !imageNatural.h) {
      return { width: STAGE_SIZE, height: STAGE_SIZE }
    }

    const stageSize = stageRef.current?.clientWidth || STAGE_SIZE
    const cover = Math.max(stageSize / imageNatural.w, stageSize / imageNatural.h)

    return {
      width: imageNatural.w * cover * scale,
      height: imageNatural.h * cover * scale,
    }
  }, [imageNatural, scale])

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setScale(1)
    setOffset({ x: 0, y: 0 })
    setImageNatural({ w: 0, h: 0 })
    setError(null)
    event.target.value = ''
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!previewUrl) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    setDragOrigin({ x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y })
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    setOffset({
      x: dragOrigin.ox + (event.clientX - dragOrigin.x),
      y: dragOrigin.oy + (event.clientY - dragOrigin.y),
    })
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
  }

  const renderCroppedBlob = async () => {
    if (!previewUrl || !imageNatural.w) return null

    const stage = stageRef.current
    if (!stage) return null

    const stageSize = stage.clientWidth || STAGE_SIZE
    const cover = Math.max(stageSize / imageNatural.w, stageSize / imageNatural.h)
    const drawW = imageNatural.w * cover * scale
    const drawH = imageNatural.h * cover * scale
    const drawX = (stageSize - drawW) / 2 + offset.x
    const drawY = (stageSize - drawH) / 2 + offset.y

    const image = await loadImage(previewUrl)
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const ratio = OUTPUT_SIZE / stageSize
    ctx.fillStyle = '#0c1220'
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.drawImage(image, drawX * ratio, drawY * ratio, drawW * ratio, drawH * ratio)

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }

  const onSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (!name.trim()) throw new Error('Informe um nome de usuário')

      await updateDisplayName(name)

      if (previewUrl) {
        const blob = await renderCroppedBlob()
        if (!blob) throw new Error('Não foi possível processar a imagem')
        await uploadAvatar(blob)
      }

      await onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const onRemovePhoto = async () => {
    setSaving(true)
    setError(null)
    try {
      await removeAvatar()
      setPreviewUrl(null)
      await onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao remover foto')
    } finally {
      setSaving(false)
    }
  }

  const activePreview = previewUrl || currentAvatarUrl

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky">
                  Perfil
                </p>
                <h2 className="font-display text-xl font-bold text-snow">Editar perfil</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-fog transition hover:bg-mist/60 hover:text-snow"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">
                  Nome de usuário
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-line-soft bg-elevated/70 px-3 text-sm text-snow outline-none focus:border-sky/40"
                  placeholder="Seu nome"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-fog">Foto de perfil</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft px-2.5 py-1.5 text-xs text-cloud transition hover:border-sky/40 hover:text-sky"
                    >
                      <ImagePlus size={14} />
                      {activePreview ? 'Trocar' : 'Adicionar'}
                    </button>
                    {currentAvatarUrl && (
                      <button
                        type="button"
                        onClick={onRemovePhoto}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft px-2.5 py-1.5 text-xs text-rose-300 transition hover:border-rose-400/40"
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickFile}
                />

                <div
                  ref={stageRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className={`relative mx-auto overflow-hidden rounded-full border border-line bg-elevated ${
                    previewUrl ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  style={{ width: STAGE_SIZE, height: STAGE_SIZE }}
                >
                  {activePreview ? (
                    <img
                      src={activePreview}
                      alt="Prévia do avatar"
                      draggable={false}
                      onLoad={(event) => {
                        setImageNatural({
                          w: event.currentTarget.naturalWidth,
                          h: event.currentTarget.naturalHeight,
                        })
                      }}
                      className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                      style={{
                        width: previewUrl ? displaySize.width : STAGE_SIZE,
                        height: previewUrl ? displaySize.height : STAGE_SIZE,
                        objectFit: previewUrl ? 'fill' : 'cover',
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-fog">
                      Sem foto
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-sky/30" />
                </div>

                {previewUrl && (
                  <label className="mt-4 flex items-center gap-3">
                    <ZoomIn size={16} className="text-fog" />
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.01}
                      value={scale}
                      onChange={(event) => setScale(Number(event.target.value))}
                      className="w-full accent-sky"
                    />
                    <span className="w-10 text-right text-xs text-fog">{scale.toFixed(2)}x</span>
                  </label>
                )}

                <p className="mt-2 text-center text-xs text-fog">
                  {previewUrl
                    ? 'Em 1x a foto já preenche o círculo. Arraste e aumente o zoom só se quiser aproximar.'
                    : 'Adicione uma imagem para recortar e posicionar.'}
                </p>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-line-soft px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm text-fog transition hover:bg-mist/50 hover:text-snow"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className="rounded-xl bg-sky/90 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-baby disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}
