import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Profile, WorkoutSession } from '@/types'

// Type-safe wrapper for Supabase - types will be generated later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

// Sync queue types
interface SyncQueueItem {
  id: string
  type: 'profile' | 'workout'
  action: 'create' | 'update' | 'delete'
  data: Profile | WorkoutSession | { id: string }
  timestamp: string
  retries: number
}

const SYNC_QUEUE_KEY = 'sync_queue'
const PROFILE_ID_MAP_KEY = 'profile_id_map' // Maps local IDs to cloud IDs

// ============ Sync Queue Management ============

export function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

export function addToSyncQueue(
  type: 'profile' | 'workout',
  action: 'create' | 'update' | 'delete',
  data: Profile | WorkoutSession | { id: string }
): void {
  const queue = getSyncQueue()

  // Remove any existing pending action for same item
  const filteredQueue = queue.filter(item => {
    if (item.type !== type) return true
    const itemId = 'id' in item.data ? item.data.id : null
    const newId = 'id' in data ? data.id : null
    return itemId !== newId
  })

  filteredQueue.push({
    id: crypto.randomUUID(),
    type,
    action,
    data,
    timestamp: new Date().toISOString(),
    retries: 0
  })

  saveSyncQueue(filteredQueue)

  // Attempt sync if online
  if (navigator.onLine && isSupabaseConfigured()) {
    processSyncQueue()
  }
}

// ============ Profile ID Mapping ============

export function getProfileIdMap(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(PROFILE_ID_MAP_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveProfileIdMap(map: Record<string, string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_ID_MAP_KEY, JSON.stringify(map))
}

export function mapLocalToCloudId(localId: string, cloudId: string): void {
  const map = getProfileIdMap()
  map[localId] = cloudId
  saveProfileIdMap(map)
}

export function getCloudId(localId: string): string | null {
  return getProfileIdMap()[localId] || null
}

// ============ Sync Processing ============

export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (!isSupabaseConfigured()) {
    return { success: 0, failed: 0 }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: 0, failed: 0 }
  }

  const queue = getSyncQueue()
  let success = 0
  let failed = 0
  const newQueue: SyncQueueItem[] = []

  for (const item of queue) {
    try {
      const processed = await processQueueItem(item, user.id)
      if (processed) {
        success++
      } else {
        // Retry later
        item.retries++
        if (item.retries < 5) {
          newQueue.push(item)
        }
        failed++
      }
    } catch (error) {
      console.error('Sync error:', error)
      item.retries++
      if (item.retries < 5) {
        newQueue.push(item)
      }
      failed++
    }
  }

  saveSyncQueue(newQueue)
  return { success, failed }
}

async function processQueueItem(item: SyncQueueItem, userId: string): Promise<boolean> {
  switch (item.type) {
    case 'profile':
      return processProfileSync(item, userId)
    case 'workout':
      return processWorkoutSync(item, userId)
    default:
      return false
  }
}

async function processProfileSync(item: SyncQueueItem, userId: string): Promise<boolean> {
  const profile = item.data as Profile

  switch (item.action) {
    case 'create': {
      const insertData = {
        user_id: userId,
        local_id: profile.id,
        name: profile.name,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        sex: profile.sex,
        daily_steps: profile.dailySteps,
        activity_level: profile.activityLevel,
        goal: profile.goal,
        exercise_ratings: profile.exerciseRatings,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      }

      const { data, error } = await db
        .from('profiles')
        .insert(insertData)
        .select('id')
        .single()

      if (error) throw error

      // Map local ID to cloud ID
      if (data) {
        mapLocalToCloudId(profile.id, data.id)
      }

      return true
    }

    case 'update': {
      const cloudId = getCloudId(profile.id)
      if (!cloudId) {
        // Profile not yet synced, queue as create instead
        addToSyncQueue('profile', 'create', profile)
        return true
      }

      const { error } = await db
        .from('profiles')
        .update({
          name: profile.name,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          sex: profile.sex,
          daily_steps: profile.dailySteps,
          activity_level: profile.activityLevel,
          goal: profile.goal,
          exercise_ratings: profile.exerciseRatings,
          updated_at: profile.updatedAt
        })
        .eq('id', cloudId)

      if (error) throw error
      return true
    }

    case 'delete': {
      const deleteData = item.data as { id: string }
      const cloudId = getCloudId(deleteData.id)
      if (!cloudId) return true // Not synced yet, nothing to delete

      const { error } = await db
        .from('profiles')
        .delete()
        .eq('id', cloudId)

      if (error) throw error
      return true
    }

    default:
      return false
  }
}

async function processWorkoutSync(item: SyncQueueItem, userId: string): Promise<boolean> {
  const workout = item.data as WorkoutSession

  // Get cloud profile ID
  const cloudProfileId = getCloudId(workout.profileId)
  if (!cloudProfileId) {
    // Profile not synced yet, retry later
    return false
  }

  switch (item.action) {
    case 'create':
    case 'update': {
      const insertData = {
        profile_id: cloudProfileId,
        exercise_id: workout.exerciseId,
        date: workout.date,
        sets: workout.sets
      }

      const { error } = await db
        .from('workout_sessions')
        .upsert(insertData, {
          onConflict: 'profile_id,exercise_id,date'
        })

      if (error) throw error
      return true
    }

    case 'delete': {
      const deleteData = item.data as { id: string; profileId: string; exerciseId: string; date: string }
      const deleteCloudProfileId = getCloudId(deleteData.profileId)
      if (!deleteCloudProfileId) return true

      const { error } = await db
        .from('workout_sessions')
        .delete()
        .eq('profile_id', deleteCloudProfileId)
        .eq('exercise_id', deleteData.exerciseId)
        .eq('date', deleteData.date)

      if (error) throw error
      return true
    }

    default:
      return false
  }
}

// ============ Pull from Cloud ============

export async function pullFromCloud(): Promise<{
  profiles: Profile[]
  workouts: WorkoutSession[]
} | null> {
  if (!isSupabaseConfigured()) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    // Fetch profiles
    const { data: dbProfiles, error: profilesError } = await db
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)

    if (profilesError) throw profilesError

    // Type for profile records from DB
    type DbProfileRow = {
      id: string
      local_id: string | null
      name: string
      age: number
      height: number
      weight: number
      sex: string | null
      daily_steps: number | null
      activity_level: string | null
      goal: string | null
      exercise_ratings: Record<string, string> | null
      created_at: string
      updated_at: string
    }

    // Type for workout records from DB
    type DbWorkoutRow = {
      id: string
      profile_id: string
      exercise_id: string
      date: string
      sets: unknown
    }

    const typedProfiles = (dbProfiles || []) as DbProfileRow[]

    // Fetch workouts for all profiles
    const profileIds = typedProfiles.map((p: DbProfileRow) => p.id)
    let dbWorkouts: DbWorkoutRow[] = []

    if (profileIds.length > 0) {
      const { data: workoutsData, error: workoutsError } = await db
        .from('workout_sessions')
        .select('*')
        .in('profile_id', profileIds)

      if (workoutsError) throw workoutsError
      dbWorkouts = (workoutsData || []) as DbWorkoutRow[]
    }

    // Convert to local format
    const profiles: Profile[] = typedProfiles.map((p: DbProfileRow) => {
      // Store ID mapping
      if (p.local_id) {
        mapLocalToCloudId(p.local_id, p.id)
      }

      return {
        id: p.local_id || p.id, // Use local ID if available
        name: p.name,
        age: p.age,
        height: p.height,
        weight: p.weight,
        sex: p.sex as Profile['sex'],
        dailySteps: p.daily_steps || undefined,
        activityLevel: p.activity_level as Profile['activityLevel'],
        goal: p.goal as Profile['goal'],
        exerciseRatings: (p.exercise_ratings || {}) as Profile['exerciseRatings'],
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }
    })

    // Create reverse map for workout profile IDs
    const cloudToLocalMap: Record<string, string> = {}
    typedProfiles.forEach((p: DbProfileRow) => {
      cloudToLocalMap[p.id] = p.local_id || p.id
    })

    const workouts: WorkoutSession[] = dbWorkouts.map((w: DbWorkoutRow) => ({
      id: w.id,
      date: w.date,
      exerciseId: w.exercise_id as WorkoutSession['exerciseId'],
      profileId: cloudToLocalMap[w.profile_id] || w.profile_id,
      sets: (w.sets || []) as WorkoutSession['sets']
    }))

    return { profiles, workouts }
  } catch (error) {
    console.error('Pull from cloud failed:', error)
    return null
  }
}

// ============ Online/Offline Listeners ============

export function setupSyncListeners(): () => void {
  const handleOnline = () => {
    console.log('Online - processing sync queue')
    processSyncQueue()
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}

// ============ Sync Status ============

export function getPendingSyncCount(): number {
  return getSyncQueue().length
}

export function hasPendingSync(): boolean {
  return getSyncQueue().length > 0
}
