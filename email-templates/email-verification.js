export const emailVerificationHtml = `
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      text-align: center;
      margin: 0;
      padding: 0;
    }

    .container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px auto;
      width: 80%;
      max-width: 600px;
    }

    h1 {
      color: #333333;
    }

    p {
      color: #666666;
    }

    button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }

    button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification</h1>
    <p>Click the following button to verify your email</p>
    <a href="http://${HOST}:${PORT}/verify?token=${rememberToken}&email=${email}">
      <button>Verify</button>
    </a>
  </div>
</body>
</html>
`;


export default {emailVerificationHtml}