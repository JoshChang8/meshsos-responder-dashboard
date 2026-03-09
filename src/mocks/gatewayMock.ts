import { Dispatch } from 'react'
import { AppAction, HouseholdRequest, MeshNode, Vehicle, SupplyType } from '../types'

// Geographic center: Waterloo, ON (realistic disaster scenario area)
const CENTER = { lat: 43.4723, lng: -80.5449 }

function minsAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}

function spread(base: number, delta: number): number {
  return base + (Math.random() - 0.5) * delta
}

// ---- Seed nodes ----
const SEED_NODES: MeshNode[] = [
  {
    id: 'GW-01',
    status: 'gateway',
    location: { lat: CENTER.lat, lng: CENTER.lng },
    lastSeen: new Date().toISOString(),
    signalDbm: -45,
    hopsToGateway: 0,
  },
  {
    id: 'B91C',
    status: 'online',
    location: { lat: CENTER.lat + 0.018, lng: CENTER.lng + 0.022 },
    lastSeen: new Date().toISOString(),
    signalDbm: -62,
    hopsToGateway: 1,
  },
  {
    id: 'C44D',
    status: 'weak',
    location: { lat: CENTER.lat + 0.012, lng: CENTER.lng - 0.030 },
    lastSeen: new Date(Date.now() - 5 * 60_000).toISOString(),
    signalDbm: -84,
    hopsToGateway: 2,
  },
  {
    id: 'D7E2',
    status: 'online',
    location: { lat: CENTER.lat - 0.014, lng: CENTER.lng + 0.026 },
    lastSeen: new Date().toISOString(),
    signalDbm: -70,
    hopsToGateway: 1,
  },
  {
    id: 'F5A1',
    status: 'offline',
    location: { lat: CENTER.lat - 0.018, lng: CENTER.lng - 0.024 },
    lastSeen: new Date(Date.now() - 31 * 60_000).toISOString(),
    signalDbm: -98,
    hopsToGateway: 3,
  },
]

// ---- Seed vehicles ----
const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'V-01',
    name: 'Vehicle 01',
    status: 'enroute',
    cargo: [
      { type: 'water', quantity: 12 },
      { type: 'food', quantity: 8 },
    ],
    assignedRequestIds: ['HH:C2E8', 'HH:D4A9'],
    location: { lat: CENTER.lat + 0.008, lng: CENTER.lng + 0.010 },
  },
  {
    id: 'V-02',
    name: 'Vehicle 02',
    status: 'enroute',
    cargo: [
      { type: 'water', quantity: 12 },
      { type: 'medical', quantity: 2 },
    ],
    assignedRequestIds: ['HH:A3F2', 'HH:B7D1'],
    location: { lat: CENTER.lat - 0.006, lng: CENTER.lng + 0.014 },
  },
  {
    id: 'V-03',
    name: 'Vehicle 03',
    status: 'available',
    cargo: [],
    assignedRequestIds: [],
    location: CENTER,
  },
]

// ---- Seed requests ----
const SEED_REQUESTS: HouseholdRequest[] = [
  {
    id: 'HH:A3F2',
    householdId: 'HH:A3F2',
    status: 'acknowledged',
    supplies: ['water', 'medical'],
    people: { infant: 1, childAdult: 2, senior: 1 },
    location: { lat: CENTER.lat + 0.020, lng: CENTER.lng + 0.025 },
    nodeId: 'B91C',
    notes: 'Ground floor accessible. No power since yesterday. Running low on clean water for 2 days.',
    medicalProfiles: [
      {
        ageTier: 'infant',
        count: 1,
        conditionType: 'chronic',
        specificNeed: 'Needs formula + vitamin drops',
      },
      {
        ageTier: 'child_adult',
        count: 1,
        conditionType: 'injury',
        specificNeed: 'Broken leg, needs splint',
      },
    ],
    triageScore: 0,
    receivedAt: minsAgo(19),
  },
  {
    id: 'HH:B7D1',
    householdId: 'HH:B7D1',
    status: 'new',
    supplies: ['medical', 'food'],
    people: { infant: 0, childAdult: 1, senior: 2 },
    location: { lat: CENTER.lat + 0.016, lng: CENTER.lng + 0.028 },
    nodeId: 'B91C',
    notes: 'Second floor. Elderly couple with limited mobility. One has dementia.',
    medicalProfiles: [
      {
        ageTier: 'senior',
        count: 1,
        conditionType: 'mental_health',
        specificNeed: 'Dementia — requires familiar caregiver',
      },
      {
        ageTier: 'senior',
        count: 1,
        conditionType: 'medication',
        specificNeed: 'Daily blood pressure meds running out',
      },
    ],
    triageScore: 0,
    receivedAt: minsAgo(23),
  },
  {
    id: 'HH:C2E8',
    householdId: 'HH:C2E8',
    status: 'acknowledged',
    supplies: ['water', 'food'],
    people: { infant: 1, childAdult: 4, senior: 0 },
    location: { lat: CENTER.lat - 0.010, lng: CENTER.lng + 0.022 },
    nodeId: 'D7E2',
    notes: 'Family with young child. Third floor. Stairs only.',
    medicalProfiles: [],
    triageScore: 0,
    receivedAt: minsAgo(32),
  },
  {
    id: 'HH:D4A9',
    householdId: 'HH:D4A9',
    status: 'new',
    supplies: ['medical'],
    people: { infant: 0, childAdult: 2, senior: 1 },
    location: { lat: CENTER.lat - 0.013, lng: CENTER.lng + 0.030 },
    nodeId: 'D7E2',
    notes: 'Senior with wheelchair. Medical supplies critically low.',
    medicalProfiles: [
      {
        ageTier: 'senior',
        count: 1,
        conditionType: 'disability',
        specificNeed: 'Wheelchair-bound, insulin-dependent diabetic',
      },
    ],
    triageScore: 0,
    receivedAt: minsAgo(43),
  },
  {
    id: 'HH:E6F3',
    householdId: 'HH:E6F3',
    status: 'dispatched',
    supplies: ['water'],
    people: { infant: 0, childAdult: 2, senior: 0 },
    location: { lat: CENTER.lat + 0.022, lng: CENTER.lng + 0.018 },
    nodeId: 'B91C',
    notes: 'Accessible ground floor. Can meet vehicle at street.',
    medicalProfiles: [],
    triageScore: 0,
    receivedAt: minsAgo(57),
  },
  {
    id: 'HH:F1B7',
    householdId: 'HH:F1B7',
    status: 'new',
    supplies: ['food', 'water'],
    people: { infant: 2, childAdult: 3, senior: 0 },
    location: { lat: CENTER.lat + 0.014, lng: CENTER.lng - 0.026 },
    nodeId: 'C44D',
    notes: 'Two infants under 6 months. Adult has postpartum complications.',
    medicalProfiles: [
      {
        ageTier: 'infant',
        count: 2,
        conditionType: 'chronic',
        specificNeed: 'Formula, diapers, and infant Tylenol needed urgently',
      },
    ],
    triageScore: 0,
    receivedAt: minsAgo(11),
  },
  {
    id: 'HH:G9C2',
    householdId: 'HH:G9C2',
    status: 'delivered',
    supplies: ['food'],
    people: { infant: 0, childAdult: 3, senior: 0 },
    location: { lat: CENTER.lat + 0.006, lng: CENTER.lng + 0.032 },
    nodeId: 'B91C',
    notes: 'Received water drop earlier. Now needs food only.',
    medicalProfiles: [],
    triageScore: 0,
    receivedAt: minsAgo(110),
  },
]

let nextHHNum = 100

function randomHousehold(): HouseholdRequest {
  const id = `HH:${(nextHHNum++).toString(16).toUpperCase().padStart(4, '0')}`
  const statuses = ['new', 'new', 'new', 'acknowledged'] as const
  const supplyOptions: SupplyType[][] = [['water'], ['food'], ['medical'], ['water', 'food'], ['water', 'medical']]
  const supplies = supplyOptions[Math.floor(Math.random() * supplyOptions.length)]
  const infant = Math.random() < 0.2 ? 1 : 0
  const senior = Math.random() < 0.25 ? 1 : 0
  const childAdult = Math.floor(Math.random() * 4) + 1
  const node = SEED_NODES[Math.floor(Math.random() * (SEED_NODES.length - 1)) + 1]

  return {
    id,
    householdId: id,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    supplies: [...supplies],
    people: { infant, childAdult, senior },
    location: {
      lat: spread(node.location.lat, 0.01),
      lng: spread(node.location.lng, 0.01),
    },
    nodeId: node.id,
    notes: 'Requesting assistance.',
    medicalProfiles: supplies.includes('medical')
      ? [{
          ageTier: senior > 0 ? 'senior' : 'child_adult',
          count: 1,
          conditionType: 'other',
          specificNeed: 'Requires medical attention',
        }]
      : [],
    triageScore: 0,
    receivedAt: minsAgo(Math.floor(Math.random() * 15)),
  }
}

export function startMockGateway(dispatch: Dispatch<AppAction>): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = []
  const intervals: ReturnType<typeof setInterval>[] = []

  // Seed nodes immediately
  SEED_NODES.forEach(node => {
    dispatch({ type: 'NODE_STATUS_UPDATED', payload: node })
  })

  // Seed vehicles immediately
  SEED_VEHICLES.forEach(vehicle => {
    dispatch({ type: 'VEHICLE_UPDATED', payload: vehicle })
  })

  // Seed requests with slight stagger
  SEED_REQUESTS.forEach((req, i) => {
    const t = setTimeout(() => {
      dispatch({ type: 'REQUEST_RECEIVED', payload: req })
    }, i * 120)
    timeouts.push(t)
  })

  // Simulation interval
  const sim = setInterval(() => {
    const roll = Math.random()

    if (roll < 0.25) {
      // Acknowledge a new request
      const newReqs = SEED_REQUESTS.filter(r => r.status === 'new')
      if (newReqs.length > 0) {
        const target = newReqs[Math.floor(Math.random() * newReqs.length)]
        target.status = 'acknowledged'
        dispatch({ type: 'REQUEST_STATUS_UPDATED', payload: { id: target.id, status: 'acknowledged' } })
      }
    } else if (roll < 0.45) {
      // Move a vehicle slightly
      const vehicle = SEED_VEHICLES[Math.floor(Math.random() * SEED_VEHICLES.length)]
      if (vehicle.status === 'enroute') {
        const updated = {
          ...vehicle,
          location: {
            lat: vehicle.location.lat + (Math.random() - 0.5) * 0.001,
            lng: vehicle.location.lng + (Math.random() - 0.5) * 0.001,
          },
        }
        vehicle.location = updated.location
        dispatch({ type: 'VEHICLE_UPDATED', payload: updated })
      }
    } else if (roll < 0.60) {
      // New incoming request
      const newReq = randomHousehold()
      SEED_REQUESTS.push(newReq)
      dispatch({ type: 'REQUEST_RECEIVED', payload: newReq })
    }
  }, 5000)

  intervals.push(sim)

  return () => {
    timeouts.forEach(clearTimeout)
    intervals.forEach(clearInterval)
  }
}
