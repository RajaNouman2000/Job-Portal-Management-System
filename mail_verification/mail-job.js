import Queue from "bull"
import { transport } from "./mail-config.js";


export const rejected = new Queue("forget", {
  limiter: {
    max: 10,
    duration: 1000,
  },
});

rejected.process(async (job) => {
  const { to, subject, html } = job.data;
  let _id = job.id;
  const mailOptions = {
    from: "rajanouman2000@gmail.com",
    to,
    subject,
    html,
  };

  try {
    // Process the job (send email)
    await transport.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    transport.close();
    
  } catch (error) {
    console.error("Error processing email job:", error.message);
  }
});

export default {rejected  };