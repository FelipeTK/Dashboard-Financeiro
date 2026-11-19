import { supabase } from '../lib/supabase'
import { updateProfile } from './financeApi'

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Faça login para continuar')
  return data.user.id
}

export async function updateDisplayName(fullName: string) {
  return updateProfile({ full_name: fullName.trim() })
}

export async function uploadAvatar(blob: Blob) {
  const userId = await requireUserId()
  const path = `${userId}/avatar.jpg`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '3600',
  })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`

  const profile = await updateProfile({ avatar_url: publicUrl })
  return profile
}

export async function removeAvatar() {
  const userId = await requireUserId()
  const path = `${userId}/avatar.jpg`

  await supabase.storage.from('avatars').remove([path])
  return updateProfile({ avatar_url: null })
}
