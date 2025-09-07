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
      case 'predict_crowd_density':
        return await predictCrowdDensity(supabaseClient, data)
      case 'detect_bottleneck':
        return await detectBottleneck(supabaseClient, data)
      case 'route_optimization':
        return await routeOptimization(supabaseClient, data)
      case 'send_alert':
        return await sendAlert(supabaseClient, data)
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

async function predictCrowdDensity(supabase: any, data: any) {
  const { zone_id } = data
  
  // Get recent IoT sensor data
  const { data: iotData } = await supabase
    .from('iot_logs')
    .select('*')
    .eq('zone_id', zone_id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Simple prediction algorithm (in real scenario, use ML model)
  const avgCount = iotData?.reduce((sum: number, log: any) => 
    sum + (log.data?.count || 0), 0) / (iotData?.length || 1)
  
  const predictedDensity = Math.min(100, avgCount * 1.2) // 20% increase prediction
  const riskLevel = predictedDensity > 80 ? 'critical' : 
                   predictedDensity > 60 ? 'high' : 
                   predictedDensity > 40 ? 'medium' : 'low'

  // Store prediction
  await supabase.from('crowd_data').insert({
    zone_id,
    current_density: avgCount,
    predicted_density: predictedDensity,
    confidence_score: 0.85,
    ai_recommendations: getRiskRecommendations(riskLevel)
  })

  return new Response(
    JSON.stringify({ 
      predicted_density: predictedDensity,
      risk_level: riskLevel,
      recommendations: getRiskRecommendations(riskLevel)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function detectBottleneck(supabase: any, data: any) {
  const { zone_ids } = data
  
  const bottlenecks = []
  
  for (const zoneId of zone_ids) {
    const { data: zoneData } = await supabase
      .from('zones')
      .select('*, crowd_data(*)')
      .eq('id', zoneId)
      .single()

    if (zoneData?.current_count > zoneData?.capacity * 0.9) {
      bottlenecks.push({
        zone_id: zoneId,
        zone_name: zoneData.name,
        congestion_level: (zoneData.current_count / zoneData.capacity) * 100,
        recommended_action: 'immediate_diversion'
      })
    }
  }

  return new Response(
    JSON.stringify({ bottlenecks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function routeOptimization(supabase: any, data: any) {
  const { from_zone, to_zone, group_size } = data
  
  // Get all zones with current density
  const { data: zones } = await supabase
    .from('zones')
    .select('*, crowd_data(*)')
    .order('current_count')

  // Simple routing logic - avoid crowded zones
  const optimalRoute = zones
    ?.filter((zone: any) => zone.current_count < zone.capacity * 0.7)
    .slice(0, 3)
    .map((zone: any) => ({
      zone_id: zone.id,
      zone_name: zone.name,
      estimated_time: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      crowd_level: 'moderate'
    }))

  return new Response(
    JSON.stringify({ 
      optimal_route: optimalRoute,
      estimated_total_time: optimalRoute?.reduce((sum: number, route: any) => 
        sum + route.estimated_time, 0) || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendAlert(supabase: any, data: any) {
  const { zone_id, message, severity, language = 'hi' } = data
  
  // Get users in the zone
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('current_zone_id', zone_id)
    .eq('receive_sms', true)

  // Create alert record
  const { data: alert } = await supabase
    .from('alerts')
    .insert({
      type: 'crowd_warning',
      message,
      language,
      zone_id,
      severity,
      status: 'sent'
    })
    .select()
    .single()

  // In real implementation, integrate with SMS/IVR service
  console.log(`Alert sent to ${users?.length || 0} users in zone ${zone_id}`)

  return new Response(
    JSON.stringify({ 
      alert_id: alert?.id,
      users_notified: users?.length || 0,
      status: 'sent'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getRiskRecommendations(riskLevel: string): string[] {
  switch (riskLevel) {
    case 'critical':
      return [
        'Immediate entry restrictions',
        'Deploy additional volunteers',
        'Activate emergency protocols',
        'Redirect crowd to alternate routes'
      ]
    case 'high':
      return [
        'Monitor closely',
        'Prepare crowd control measures',
        'Alert nearby zones',
        'Consider entry slowdown'
      ]
    case 'medium':
      return [
        'Continue monitoring',
        'Maintain current flow',
        'Keep volunteers alert'
      ]
    default:
      return [
        'Normal operations',
        'Regular monitoring sufficient'
      ]
  }
}