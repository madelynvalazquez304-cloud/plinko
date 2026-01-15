// supabase/functions/mpesa-callback/index.ts
// M-Pesa Callback Handler

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        const callbackData = await req.json()

        console.log('M-Pesa Callback Received:', JSON.stringify(callbackData))

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const body = callbackData.Body?.stkCallback

        if (!body) {
            throw new Error('Invalid callback format')
        }

        const checkoutRequestID = body.CheckoutRequestID
        const merchantRequestID = body.MerchantRequestID
        const resultCode = body.ResultCode
        const resultDesc = body.ResultDesc

        let mpesaReceiptNumber = null

        // Extract receipt number if payment successful
        if (resultCode === 0 && body.CallbackMetadata?.Item) {
            const receiptItem = body.CallbackMetadata.Item.find(
                (item: any) => item.Name === 'MpesaReceiptNumber'
            )
            mpesaReceiptNumber = receiptItem?.Value
        }

        // Log callback to database
        await supabaseClient.rpc('log_mpesa_callback', {
            p_checkout_request_id: checkoutRequestID,
            p_merchant_request_id: merchantRequestID,
            p_result_code: resultCode,
            p_result_desc: resultDesc,
            p_mpesa_receipt_number: mpesaReceiptNumber,
            p_callback_data: callbackData
        })

        return new Response(
            JSON.stringify({ ResultCode: 0, ResultDesc: 'Success' }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Callback processing error:', error)
        return new Response(
            JSON.stringify({ ResultCode: 1, ResultDesc: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200, // M-Pesa expects 200 even on errors
            }
        )
    }
})
