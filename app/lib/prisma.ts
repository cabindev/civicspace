// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

// Declare a global variable to store the Prisma instance
declare global {
  var prisma: PrismaClient | undefined
}

// Create a new PrismaClient instance or use the existing one
const prisma = global.prisma || new PrismaClient()

// In development mode, attach the PrismaClient instance to the global object
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export default prisma