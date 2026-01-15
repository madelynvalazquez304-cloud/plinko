// supabase/functions/mpesa-stk-push/index.ts
// M-Pesa Daraja API STK Push (Lipa Na M-Pesa Online)
// Supports both PAYBILL (CustomerPayBillOnline) and TILL NUMBER (CustomerBuyGoodsOnline)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phoneNumber, amount, userId } = await req.json()

        console.log('STK Push request received:', { phoneNumber, amount, userId })

        // Validate inputs
        if (!phoneNumber || !amount || !userId) {
            throw new Error('Missing required fields: phoneNumber, amount, userId')
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase environment variables not configured')
        }

        const supabaseClient = createClient(supabaseUrl, supabaseKey)

        // ==============================
        // FETCH CREDENTIALS FROM DB
        // ==============================
        // Try to fetch 'mpesa' OR 'mobile_money' type
        const { data: gateways, error: gatewayError } = await supabaseClient
            .from('gateways')
            .select('config, type')
            .in('type', ['mpesa', 'mobile_money'])
            .eq('is_active', true)

        if (gatewayError) {
            console.error('Database error fetching gateways:', gatewayError)
            throw new Error('Database error while fetching M-Pesa config')
        }

        const gatewayData = gateways?.[0]

        if (!gatewayData) {
            console.error('No active M-Pesa gateway found')
            throw new Error('M-Pesa gateway not configured or inactive in Admin Panel.')
        }

        const creds = gatewayData.config

        // Helper to find value by multiple possible keys
        const getVal = (keys: string[]) => {
            for (const k of keys) {
                if (creds[k]) return creds[k]
            }
            return null
        }

        // Map credentials with fallbacks
        const CONSUMER_KEY = getVal(['consumerKey', 'consumer_key', 'ConsumerKey'])
        const CONSUMER_SECRET = getVal(['consumerSecret', 'consumer_secret', 'ConsumerSecret'])
        const BUSINESS_SHORTCODE = getVal(['shortcode', 'business_shortcode', 'BusinessShortCode', 'paybill', 'till'])
        const PASSKEY = getVal(['passkey', 'Passkey'])
        const CALLBACK_URL = getVal(['callbackUrl', 'callback_url', 'CallBackURL'])
        const ENV = getVal(['env', 'environment', 'Environment'])

        // Determine Transaction Type (Paybill vs Till)
        // Check for explicit 'type' in config or infer
        const TYPE = getVal(['type', 'accountType', 'AccountType']) || 'paybill'
        const isTill = TYPE.toLowerCase().includes('till') || TYPE.toLowerCase().includes('good') || TYPE.toLowerCase().includes('buy')

        const TRANSACTION_TYPE = isTill ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline'

        // Validation
        if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORTCODE || !PASSKEY || !CALLBACK_URL) {
            console.error('Missing config keys:', {
                hasKey: !!CONSUMER_KEY,
                hasSecret: !!CONSUMER_SECRET,
                hasShortcode: !!BUSINESS_SHORTCODE,
                hasPasskey: !!PASSKEY,
                hasCallback: !!CALLBACK_URL
            })
            throw new Error(`Invalid M-Pesa config in Admin Panel. Missing required keys.`)
        }

        // Environment (Default to production if not specified)
        const isProduction = ENV === 'production' || ENV !== 'sandbox'

        console.log(`Using ${isProduction ? 'PRODUCTION' : 'SANDBOX'} environment`)
        console.log(`Transaction Type: ${TRANSACTION_TYPE} (Config type: ${TYPE})`)

        // ==============================
        // STEP 1: GENERATE ACCESS TOKEN
        // ==============================
        const authString = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)
        const tokenUrl = isProduction
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

        const tokenResponse = await fetch(tokenUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`
            }
        })

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            console.error('OAuth token error:', errorText)
            throw new Error(`Failed to get OAuth token: ${errorText}`)
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            throw new Error('No access token received from M-Pesa')
        }

        // ==============================
        // STEP 2: GENERATE PASSWORD
        // ==============================
        const now = new Date()
        const timestamp = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0')

        const passwordString = `${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`
        const password = btoa(passwordString)

        // ==============================
        // STEP 4: FORMAT PHONE NUMBER
        // ==============================
        // Logic to ensure 2547...
        let formattedPhone = phoneNumber.trim().replace(/\s/g, '')
        if (formattedPhone.startsWith('0')) {
            formattedPhone = `254${formattedPhone.slice(1)}`
        } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.slice(1)
        } else if (formattedPhone.startsWith('254')) {
            // ok
        } else {
            // Assume it needs 254 if not present (e.g. 712...)
            formattedPhone = `254${formattedPhone}`
        }

        // ==============================
        // STEP 5: PREPARE STK PUSH
        // ==============================
        const stkUrl = isProduction
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

        const ACCOUNT_REFERENCE = `USER${userId.slice(0, 5).toUpperCase()}`
        const TRANSACTION_DESC = 'Deposit'

        const stkPayload = {
            BusinessShortCode: BUSINESS_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: TRANSACTION_TYPE,
            Amount: Math.floor(amount),
            PartyA: formattedPhone,
            PartyB: BUSINESS_SHORTCODE, // For Till, PartyB is also the Shortcode (Store Number)
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: ACCOUNT_REFERENCE,
            TransactionDesc: TRANSACTION_DESC
        }

        console.log('Sending STK Push Payload:', { ...stkPayload, Password: '***' })

        const stkResponse = await fetch(stkUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stkPayload)
        })

        const stkData = await stkResponse.json()
        console.log('STK Push Response Body:', stkData)

        if (stkData.ResponseCode !== '0') {
            throw new Error(stkData.ResponseDescription || stkData.errorMessage || 'STK Push Request Failed')
        }

        // ==============================
        // DB LOGGING (Supabase)
        // ==============================

        // 1. Create Transaction
        const { data: transaction, error: txError } = await supabaseClient
            .from('transactions')
            .insert([{
                user_id: userId,
                type: 'deposit',
                amount: amount,
                status: 'pending',
                method: 'M-PESA'
            }])
            .select()
            .single()

        if (txError) {
            console.error('Failed to log transaction:', txError)
            // Don't fail the request if just logging failed, but good to know
        } else {
            // 2. Create M-Pesa Transaction Log
            await supabaseClient
                .from('mpesa_transactions')
                .insert([{
                    user_id: userId,
                    merchant_request_id: stkData.MerchantRequestID,
                    checkout_request_id: stkData.CheckoutRequestID,
                    phone_number: formattedPhone,
                    amount: amount,
                    account_reference: ACCOUNT_REFERENCE,
                    transaction_desc: TRANSACTION_DESC,
                    transaction_id: transaction.id,
                    status: 'pending'
                }])
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'STK Push initiated successfully',
                data: stkData
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error('Edge Function Error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Internal Server Error',
                details: error.toString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
