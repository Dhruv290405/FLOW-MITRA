import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'generate_pass':
        return await generatePass(supabaseClient, data)
      case 'verify_aadhaar':
        return await verifyAadhaar(supabaseClient, data)
      case 'scan_qr':
        return await scanQR(supabaseClient, data)
      case 'extend_pass':
        return await extendPass(supabaseClient, data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function verifyAadhaar(supabase: any, data: any) {
  const { aadhaar_number } = data
  
  // Basic Aadhaar validation (12 digits)
  if (!/^\d{12}$/.test(aadhaar_number)) {
    throw new Error('Invalid Aadhaar number format')
  }

  // Check if Aadhaar already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('aadhaar_number', aadhaar_number)
    .single()

  return new Response(
    JSON.stringify({ 
      is_valid: true,
      exists: !!existingUser,
      user: existingUser || null
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generatePass(supabase: any, data: any) {
  const { 
    aadhaar_number, 
    full_name, 
    phone, 
    family_members = [], 
    slot_start,
    slot_duration_hours = 24 
  } = data

  if (family_members.length > 10) {
    throw new Error('Maximum 10 people allowed per pass')
  }

  // Create or update user
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({
      aadhaar_number,
      full_name,
      phone,
      time_slot: {
        checkIn: slot_start,
        checkOut: new Date(new Date(slot_start).getTime() + (slot_duration_hours * 60 * 60 * 1000)),
        extended: false
      }
    })
    .select()
    .single()

  if (userError) throw userError

  // Generate unique pass ID
  const passId = `SIMHASTHA_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  
  // Calculate exit deadline
  const exitDeadline = new Date(new Date(slot_start).getTime() + (slot_duration_hours * 60 * 60 * 1000))
  
  // Create QR data
  const qrData = {
    pass_id: passId,
    aadhaar: aadhaar_number,
    name: full_name,
    group_size: family_members.length + 1,
    slot_start,
    exit_deadline: exitDeadline.toISOString(),
    family_members
  }

  // In real implementation, generate actual QR code image
  const qrCodeData = `data:image/svg+xml;base64,${btoa(generateQRSVG(JSON.stringify(qrData)))}`

  // Create pass record
  const { data: pass, error: passError } = await supabase
    .from('passes')
    .insert({
      pass_id: passId,
      qr_code: qrCodeData,
      user_id: user.id,
      family_members,
      group_size: family_members.length + 1,
      slot_start,
      slot_end: new Date(new Date(slot_start).getTime() + (2 * 60 * 60 * 1000)), // 2 hour slot
      exit_deadline: exitDeadline
    })
    .select()
    .single()

  if (passError) throw passError

  return new Response(
    JSON.stringify({ 
      pass_id: passId,
      qr_code: qrCodeData,
      user_id: user.id,
      slot_start,
      exit_deadline: exitDeadline,
      group_size: family_members.length + 1,
      family_members
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function scanQR(supabase: any, data: any) {
  const { qr_data, scan_type, zone_id } = data // scan_type: 'entry' or 'exit'
  
  let passData
  try {
    passData = JSON.parse(qr_data)
  } catch {
    throw new Error('Invalid QR code format')
  }

  const { data: pass } = await supabase
    .from('passes')
    .select('*, users(*)')
    .eq('pass_id', passData.pass_id)
    .single()

  if (!pass) {
    throw new Error('Pass not found')
  }

  if (pass.status !== 'active') {
    throw new Error('Pass is not active')
  }

  const now = new Date()
  
  if (scan_type === 'entry') {
    if (now > new Date(pass.slot_end)) {
      throw new Error('Entry slot expired')
    }
    
    // Update pass and user location
    await supabase.from('passes').update({ 
      scanned_at_entry: now.toISOString() 
    }).eq('id', pass.id)
    
    await supabase.from('users').update({ 
      current_zone_id: zone_id 
    }).eq('id', pass.user_id)

    return new Response(
      JSON.stringify({ 
        message: 'Entry successful',
        pass_id: pass.pass_id,
        user_name: pass.users.full_name,
        group_size: pass.group_size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } else if (scan_type === 'exit') {
    await supabase.from('passes').update({ 
      scanned_at_exit: now.toISOString() 
    }).eq('id', pass.id)
    
    // Check if exit is after deadline
    if (now > new Date(pass.exit_deadline)) {
      const hoursLate = Math.ceil((now.getTime() - new Date(pass.exit_deadline).getTime()) / (1000 * 60 * 60))
      const penaltyAmount = hoursLate * 500 // ₹500 per hour

      // Create penalty record
      await supabase.from('penalties').insert({
        user_id: pass.user_id,
        pass_id: pass.id,
        reason: 'Late exit',
        amount: penaltyAmount,
        hours_late: hoursLate
      })

      await supabase.from('passes').update({ 
        status: 'expired' 
      }).eq('id', pass.id)

      return new Response(
        JSON.stringify({
          message: 'Late exit - penalty applied',
          penalty_amount: penaltyAmount,
          hours_late: hoursLate,
          pass_id: pass.pass_id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      await supabase.from('passes').update({ 
        status: 'used' 
      }).eq('id', pass.id)
      
      await supabase.from('users').update({ 
        status: 'exited',
        current_zone_id: null 
      }).eq('id', pass.user_id)

      return new Response(
        JSON.stringify({ 
          message: 'Exit successful',
          pass_id: pass.pass_id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  throw new Error('Invalid scan type')
}

async function extendPass(supabase: any, data: any) {
  const { pass_id, additional_hours, tent_booking = false } = data
  
  const { data: pass } = await supabase
    .from('passes')
    .select('*')
    .eq('pass_id', pass_id)
    .single()

  if (!pass) {
    throw new Error('Pass not found')
  }

  const extensionCost = additional_hours * 100 // ₹100 per hour
  const tentCost = tent_booking ? 2000 : 0 // ₹2000 for tent
  const totalCost = extensionCost + tentCost

  // Create extension record
  const { data: extension } = await supabase
    .from('extensions')
    .insert({
      pass_id: pass.id,
      user_id: pass.user_id,
      additional_hours,
      extension_cost: extensionCost,
      tent_booking,
      tent_cost: tentCost,
      total_cost: totalCost,
      payment_status: 'paid', // Mock payment success
      approved: true
    })
    .select()
    .single()

  // Update pass deadline
  const newDeadline = new Date(new Date(pass.exit_deadline).getTime() + (additional_hours * 60 * 60 * 1000))
  
  await supabase.from('passes').update({ 
    exit_deadline: newDeadline.toISOString() 
  }).eq('id', pass.id)

  return new Response(
    JSON.stringify({
      message: 'Extension successful',
      extension_id: extension.id,
      new_exit_deadline: newDeadline,
      amount_charged: totalCost,
      tent_booked: tent_booking
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Simple QR SVG generator (in real implementation, use proper QR library)
function generateQRSVG(data: string): string {
  const size = 200
  const modules = 25
  const moduleSize = size / modules
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`
  
  // Simple pattern based on data hash
  const hash = data.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      if ((hash + i * j) % 3 === 0) {
        svg += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }
  
  svg += '</svg>'
  return svg
}