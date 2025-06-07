import express from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const readEmailsFromCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const emails = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.email) {
          emails.push(row.email);
        }
      })
      .on('end', () => resolve(emails))
      .on('error', reject);
  });
};

app.get('/send-emails', async (req, res) => {
  try {
    const emails = await readEmailsFromCSV('emails.csv');
    const results = [];

    for (const email of emails) {
      const mailOptions = {
        from: `"Your Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'email sender',
        text: 'Hello how are you'
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        results.push({ email, status: 'Sent', messageId: info.messageId });
      } catch (err) {
        results.push({ email, status: 'Failed', error: err.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send emails: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


//to run this
//node server.js -> command in terminal

//Next keep mails which u want in csv file

//give ur email and pass in .env file from app password from google service

//go to postman and create a get request
//http://localhost:3000/send-emails
//and click send

//mails will be sent