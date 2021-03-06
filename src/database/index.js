import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'
import config from '../config'

const get = async url => {
  const response = await fetch(url)
  const json = await response.json()
  return json
}

let orbitdb

// Databases
let programs

// Start IPFS
export const initIPFS = async () => {
  return await IPFS.create()
}

// Start OrbitDB
export const initOrbitDB = async (ipfs) => {
  orbitdb = await OrbitDB.createInstance(ipfs)
  return orbitdb
}

export const getAllDatabases = async () => {
  if (!programs && orbitdb) {
    // Load programs database
    programs = await orbitdb.feed('network.programs', {
      accessController: { write: [orbitdb.identity.id] },
      create: true
    })
    await programs.load()
  }

  return programs
    ? programs.iterator({ limit: -1 }).collect()
    : []
}

export const getDB = async (address) => {
  const db = await orbitdb.open(address)
  await db.load()
  return db
}

export const addDatabase = async (address) => {
  const db = await orbitdb.open(address)
  return programs.add({
    name: db.dbname,
    type: db.type,
    address: address,
    added: Date.now()
  })
}

export const createDatabase = async (name, type) => {
  const db = await orbitdb.create(name, type)
  return programs.add({ 
    name,
    type,
    address: db.address.toString(),
    added: Date.now()
  })
}

export const removeDatabase = async (hash) => {
  return programs.remove(hash)
}
