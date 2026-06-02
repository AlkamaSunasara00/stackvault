import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'

export async function POST(request: NextRequest) {
  const supaUser = await getAuthUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (supaUser.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { environment_id, key, value, description, is_secret, variables } = body
  if (!environment_id) return NextResponse.json({ error: 'Missing environment ID' }, { status: 400 })

  // Verify ownership via environment -> project
  const env = await prisma.environment.findFirst({ where: { id: environment_id }, include: { project: true } })
  if (!env || env.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (Array.isArray(variables)) {
    // Bulk create
    const createdVariables = []
    for (const v of variables) {
      if (!v.key || v.value === undefined) continue
      
      // Ensure we don't duplicate keys within the same environment
      const existingVar = await prisma.environmentVariable.findFirst({
        where: { environment_id, key: v.key }
      })
      
      let variable
      if (existingVar) {
        // Update existing variable
        variable = await prisma.environmentVariable.update({
          where: { id: existingVar.id },
          data: { value: String(v.value), description: v.description || existingVar.description, is_secret: v.is_secret ?? existingVar.is_secret }
        })
      } else {
        // Create new variable
        variable = await prisma.environmentVariable.create({
          data: {
            environment_id,
            key: v.key,
            value: String(v.value),
            description: v.description || null,
            is_secret: v.is_secret || false,
          },
        })
      }
      createdVariables.push(variable)
    }
    return NextResponse.json({ variables: createdVariables }, { status: 201 })
  } else {
    // Single create
    if (!key || value === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const existingVar = await prisma.environmentVariable.findFirst({
      where: { environment_id, key }
    })

    if (existingVar) {
      const variable = await prisma.environmentVariable.update({
        where: { id: existingVar.id },
        data: { value: String(value), description: description || existingVar.description, is_secret: is_secret ?? existingVar.is_secret }
      })
      return NextResponse.json({ variable }, { status: 201 })
    }

    const variable = await prisma.environmentVariable.create({
      data: { environment_id, key, value: String(value), description: description || null, is_secret: is_secret || false },
    })
    return NextResponse.json({ variable }, { status: 201 })
  }
}
