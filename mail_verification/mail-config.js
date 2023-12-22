import nodemailer from "nodemailer";


export const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rajanouman2000@gmail.com",
    pass: "zvtlgkxeoybfosjb",
  },
});

export default {transport}