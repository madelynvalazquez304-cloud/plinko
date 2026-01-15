// supabase/functions/mpesa-stk-push/index.ts
// M-Pesa Daraja API STK Push (Lipa Na M-Pesa Online) - PAYBILL

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

        console.log('STK Push request:', { phoneNumber, amount, userId })

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

        // Get M-Pesa credentials from database
        const { data: creds, error: credsError } = await supabaseClient
            .from('mpesa_credentials')
            .select('*')
            .eq('is_active', true)
            .single()

        if (credsError || !creds) {
            console.error('Failed to fetch M-Pesa credentials:', credsError)
            throw new Error('M-Pesa credentials not configured. Please configure in Admin Panel.')
        }

        console.log('M-Pesa credentials loaded:', {
            shortcode: creds.business_short_code,
            environment: creds.environment
        })

        // STEP 1: Generate OAuth Access Token
        const authString = btoa(`${creds.consumer_key}:${creds.consumer_secret}`)
        const tokenUrl = creds.environment === 'production'
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

        console.log('Requesting OAuth token from:', tokenUrl)

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

        console.log('OAuth token obtained successfully')

        // STEP 2: Generate Timestamp (Format: YYYYMMDDHHmmss)
        const now = new Date()
        const timestamp = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0')

        console.log('Generated timestamp:', timestamp)

        // STEP 3: Generate Password (Base64: BusinessShortcode + Passkey + Timestamp)
        const passwordString = `${creds.business_short_code}${creds.passkey}${timestamp}`
        const password = btoa(passwordString)

        // STEP 4: Format Phone Number (254XXXXXXXXX)
        let formattedPhone = phoneNumber.trim().replace(/\s/g, '')

        if (formattedPhone.startsWith('0')) {
            formattedPhone = `254${formattedPhone.slice(1)}`
        } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.slice(1)
        } else if (formattedPhone.startsWith('254')) {
            // Already in correct format
        } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
            formattedPhone = `254${formattedPhone}`
        } else {
            throw new Error('Invalid phone number format. Use 0712345678 or 254712345678')
        }

        console.log('Formatted phone number:', formattedPhone)

        // STEP 5: Prepare STK Push Request
        const stkUrl = creds.environment === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

        const accountReference = `USER${userId.slice(0, 8).toUpperCase()}`
        const transactionDesc = 'StakeClone Deposit'

        const stkPayload = {
            BusinessShortCode: creds.business_short_code,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline', // PAYBILL (not till)
            Amount: Math.floor(amount), // Must be integer
            PartyA: formattedPhone, // Customer phone number
            PartyB: creds.business_short_code, // Paybill number
            PhoneNumber: formattedPhone, // Phone to receive STK push
            CallBackURL: creds.callback_url,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc
        }

        console.log('STK Push payload:', {
            ...stkPayload,
            Password: '***REDACTED***'
        })

        // STEP 6: Send STK Push Request
        const stkResponse = await fetch(stkUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stkPayload)
        })

        const stkData = await stkResponse.json()
        console.log('STK Push response:', stkData)

        // Check if STK Push was successful
        if (stkData.ResponseCode !== '0') {
            throw new Error(stkData.ResponseDescription || stkData.errorMessage || 'STK Push failed')
        }

        // STEP 7: Create transaction records in database
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
            console.error('Failed to create transaction:', txError)
            throw txError
        }

        // Create M-Pesa transaction record
        const { error: mpesaTxError } = await supabaseClient
            .from('mpesa_transactions')
            .insert([{
                user_id: userId,
                merchant_request_id: stkData.MerchantRequestID,
                checkout_request_id: stkData.CheckoutRequestID,
                phone_number: formattedPhone,
                amount: amount,
                account_reference: accountReference,
                transaction_desc: transactionDesc,
                transaction_id: transaction.id,
                status: 'pending'
            }])

        if (mpesaTxError) {
            console.error('Failed to create M-Pesa transaction:', mpesaTxError)
        }

        console.log('STK Push sent successfully:', {
            MerchantRequestID: stkData.MerchantRequestID,
            CheckoutRequestID: stkData.CheckoutRequestID
        })

        // STEP 8: Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'STK Push sent successfully',
                checkoutRequestId: stkData.CheckoutRequestID,
                merchantRequestId: stkData.MerchantRequestID
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error('STK Push error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'STK Push failed',
                details: error.toString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
