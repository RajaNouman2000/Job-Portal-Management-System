
export const sendApiResponse = (res, data, message , statusCode = 200) => {
    const responseData = {
        success: true,
        statusCode,
        data,
        message,
    };

    if (data.redirectUrl) {
        console.log(data.redirectUrl);
        // Redirect to the specified URL
        res.redirect(data.redirectUrl);
    } else {
        // Send JSON response
        res.status(statusCode).json(responseData);
    }
};


export  const sendApiError = (
    res,
    message= "Internal Server Error",
    logid,
    statusCode=500
  ) => {
   

    res.status(statusCode).json({
      success: false,
      statusCode:statusCode,
      logid:logid,
      message: message,
     
    });
  };


  export default {sendApiError,sendApiResponse}
  
  