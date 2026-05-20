import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gemstoneApi } from '../api/gemstones'

// ─────────────────────────────────────────────
// Query keys — centralised so invalidation
// always targets the exact same cache entries
// ─────────────────────────────────────────────

const KEYS = {
  all:    ['gemstones'],
  detail: (id) => ['gemstones', id],
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export function useGemStones() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => gemstoneApi.getAll().then(r => r.data),
    staleTime: 30_000,
  })
}

export function useGemStone(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => gemstoneApi.getById(id).then(r => r.data),
    enabled:  !!id && !isNaN(id),
    staleTime: 60_000,
  })
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export function useCreateGemStone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => gemstoneApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export function useUpdateGemStone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => gemstoneApi.update(formData),
    onSuccess: (_, formData) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      // Also invalidate the specific detail cache for this stone
      const id = formData instanceof FormData
        ? Number(formData.get('Id'))
        : formData.Id
      if (id) qc.invalidateQueries({ queryKey: KEYS.detail(id) })
    },
  })
}

export function useDeleteGemStone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => gemstoneApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export function useRestoreGemStone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => gemstoneApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}