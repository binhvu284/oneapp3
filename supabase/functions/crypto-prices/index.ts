import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/config.ts";


serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const coins = url.searchParams.get('coins') || 'bitcoin,ethereum,solana,binancecoin,ripple';
    const currency = url.searchParams.get('currency') || 'usd,vnd';

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
