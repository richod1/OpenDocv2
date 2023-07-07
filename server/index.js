const express=require("express")
const cors=require("cors")
const paystack=require("paystack")(process.env.PAYSTACK_API)
const port=3000
const app=express()
require("dotenv").config();

app.use(express.json())
app.use(cors())

// payment endpont
app.post("/api/payment/create",async(req,res)=>{
    const amount=req.body.amount;
    const email=req.body.email;

    try{
        const payment=await paystack.transaction.initialize({
            amount:amount*100,
            email:email,
            currency:"GH",
        })
        res.status(201).json({
            authorization_url:payment.data.authorization_url,
        })

    }catch(err){
        console.log("Paystack err:",err)
        res.status(500).json({err:"Something went wrong"})

    }

})

// payment callback

app.post('/api/payments/callback',async (req,res)=>{
    try{
        const paymentReference = req.body.reference;
    const payment = await paystack.transaction.verify(paymentReference);

    // Process payment status and perform necessary actions
    if (payment.data.status === 'success') {
      // Payment success, grant access or perform any other required actions
      res.status(200).end();
    } else {
      // Payment failed or pending, handle accordingly
      res.status(400).end();
    }

    }catch(err){
        console.log("Paystack callback faild",err)
        res.status(500).json({
            err:"Faied to callback payment"
        }).end();
    }
})

app.listen(port,(err)=>{
    if(err) throw new Error("Server is asleep")
    console.log(`server is up on port ${port}`)
})