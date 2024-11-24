const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { handleRecord } = require('../helpers/RecordHandler.js');
const { OperationEnums } = require('../helpers/utilityEnum.js');
const exeQuery = require('../helpers/exeQuery');
const dbUtility = require('../dbUtility');


router.use(express.json());


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yaswanthpg9@gmail.com', 
        pass: 'bigmixvfocxidpme'       // Your App Password
    }
});



router.get('/SignIn', (req, res) => {
try {
    const data = req.query;
    console.log(data);
    handleRecord(req, res, data, OperationEnums().SIGNIN);
} catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error While SIGNIN' });
}
});

// Email Service
router.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;
    
    // Email options
    const mailOptions = {
        from: '"Gireesh" <yaswanthpg9@gmail.com>', // Sender's name and email
        to: to,                                     // Recipient email
        subject: subject,                           // Email subject
        text: text,                                 // Plain text body
        html: html                                  // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error while sending email:', error);
        res.status(500).json({ message: 'Error while sending email', error: error.message });
    }
});

//#region ManageRequestPass
router.post('/ManageRequestPass', async (req, res) => {
    try {
    
        if (!req.body || !req.body.orgid || !req.body.userid || !req.body.Operation || !req.body.RequestPass || !req.body.Attendees) {
            return res.status(400).send({ error: 'Missing required parameters' });
        }

        exeQuery.SpManageRequestPass(req.body, (error, results) => {
            if (error) {
                res.status(400).send({ error: error.message });
                return;
            }

            res.status(200).send(results);
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});




router.get('/getReqPass', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETREQPASS);
});

router.get('/getReqPassById', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETREQPASSBYID);
});
router.get('/AttendeInActive', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().ADETAIL);
});
//#endregion ManageRequestPass


//region PassApproval&Email
router.post('/PassApproval&Email', async (req, res) => {
    const { RequestId, Status, UserId, to, subject, text, html } = req.body;

    // Validate required fields
    if (!RequestId || !Status || !UserId) {
        return res.status(400).json({ message: 'Missing required fields', Status: false });
    }

    // SQL query to update status
    const updateStatusQuery = `
        UPDATE dbo.RequestPass
        SET Status = '${Status}',
            UpdatedBy = '${UserId}',
            UpdatedOn = dbo.GetISTTime()
        WHERE RequestId = '${RequestId}'
    `;

    try {
        // Execute the update query
        const rowsAffected = await dbUtility.executeQueryrowsAffected(updateStatusQuery);

        if (rowsAffected === 0) {
            return res.status(200).json({ message: 'Status not updated', Status: false });
        }

        // Check if email should be sent
        if (Status.toLowerCase() === 'approve') {
            try {
                // Email options
                const mailOptions = {
                    from: '"Gireesh" <yaswanthpg9@gmail.com>', // Sender's name and email
                    to: to,
                    subject: subject,
                    text: text,
                    html: html
                };

                // Send the email
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);

                return res.status(200).json({
                    message: 'Status updated and email sent successfully',
                    Status: true,
                    emailResponse: info.response
                });
            } catch (emailError) {
                console.error('Error while sending email:', emailError);
                return res.status(500).json({
                    message: 'Status updated, but email sending failed',
                    Status: false,
                    error: emailError.message
                });
            }
        }

        // If no email is sent, respond with status update success
        res.status(200).json({
            message: 'Status updated successfully',
            Status: true
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({
            message: 'Error while updating status',
            Status: false,
            error: dbError.message
        });
    }
});

//#endregion PassApproval&email


module.exports = router;
