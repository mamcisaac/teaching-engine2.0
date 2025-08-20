#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findEmilyAccount() {
  try {
    // Check all users to find Emily
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    console.log('All users in database:')
    for (const user of users) {
      console.log(`  ${user.name} - ${user.email}`)
    }
    
    // Look for Emily specifically
    const emily = users.find(u => 
      u.name?.toLowerCase().includes('emily') || 
      u.name?.toLowerCase().includes('mcisaac') ||
      u.email?.toLowerCase().includes('emily')
    )
    
    if (emily) {
      console.log('\n✅ Found Emily:')
      console.log(`  ID: ${emily.id}`)
      console.log(`  Name: ${emily.name}`)
      console.log(`  Email: ${emily.email}`)
    } else {
      console.log('\n❌ Emily not found')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findEmilyAccount()