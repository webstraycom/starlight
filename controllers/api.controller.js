exports.sendImage = async function(request, response) {
  try {
    response.send(response.locals.imageBuffer);
  } catch (error) {
    console.error("Error in api controller: ", error.message);
  }
};