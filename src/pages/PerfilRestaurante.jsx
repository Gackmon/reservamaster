import React, { useEffect, useState } from 'react'
import { Loader2, ImagePlus, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { entities, supabase } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import toast from 'react-hot-toast'

async function uploadImage(file, restaurantId, kind) {
  const ext = file.name.split('.').pop()
  const path = `${restaurantId}/${kind}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('restaurant-media').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('restaurant-media').getPublicUrl(path)
  return data.publicUrl
}

export default function PerfilRestaurante() {
  const { restaurant, loading, reload } = useRestaurant()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    if (restaurant) setForm(restaurant)
  }, [restaurant])

  async function handleFileChange(e, kind) {
    const file = e.target.files?.[0]
    if (!file || !restaurant) return
    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingCover
    setUploading(true)
    try {
      const url = await uploadImage(file, restaurant.id, kind)
      setForm((f) => ({ ...f, [kind === 'logo' ? 'logo_url' : 'cover_image_url']: url }))
      toast.success('Imagem enviada!')
    } catch (err) {
      toast.error('Erro ao enviar imagem. Verifique se o bucket "restaurant-media" existe no Supabase Storage.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await entities.Restaurant.update(restaurant.id, {
        name: form.name,
        slug: form.slug,
        logo_url: form.logo_url,
        cover_image_url: form.cover_image_url,
      })
      toast.success('Perfil atualizado!')
      reload()
    } catch (err) {
      toast.error('Erro ao salvar. O slug já pode estar em uso.')
    } finally {
      setSaving(false)
    }
  }

  function copyPublicLink() {
    const url = `${window.location.origin}/r/${form.slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  if (loading || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Perfil do Restaurante</h1>

      <Card>
        <CardHeader>
          <CardTitle>Imagem de capa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/40">
            {form.cover_image_url ? (
              <img src={form.cover_image_url} alt="Capa" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <label className="mt-2 block">
            <span className="sr-only">Enviar capa</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'cover')} id="cover-upload" />
            <Button variant="outline" className="w-full" asChild disabled={uploadingCover}>
              <label htmlFor="cover-upload" className="cursor-pointer">
                {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar imagem de capa'}
              </label>
            </Button>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-secondary/40">
              {form.logo_url ? <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
            </div>
            <label htmlFor="logo-upload" className="flex-1">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} id="logo-upload" />
              <Button variant="outline" className="w-full" asChild disabled={uploadingLogo}>
                <span className="cursor-pointer">{uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar logo'}</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados públicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome do restaurante</Label>
            <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL pública)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/r/</span>
              <Input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPublicLink}>
              <Copy className="h-4 w-4" /> Copiar link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/r/${form.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Ver página pública
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar perfil'}
      </Button>
    </div>
  )
}
