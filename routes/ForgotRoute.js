const express = require('express')
const router = express.Router();
const model = require('../models/userModel');
const bcrypt = require('bcrypt');

router.post('/reset-password',async (req,res) => {
    try{
        const {email,newPassword} = req.body;
        if(!email || !newPassword){
            return res.status(404).json({message:'Missing Fields'});
        }

        console.log(req.body)

        const user = await model.findOne({email});
        if(!user){
            return res.status(404).json({meassge:'User not found'});
        }

        console.log(user)

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password= hashedPassword;

        await user.save();

        console.log(user)

        console.log("password reset called");
        res.status(200).json({message:'password reset sucessful'});
    }
    catch(err){
        console.error('Reset error:', err);
    res.status(500).json({ message: 'Internal server error' });
    }
    
});



module.exports = router;