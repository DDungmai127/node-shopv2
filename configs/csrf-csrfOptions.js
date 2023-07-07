// CSRF_CSRF_SECRET is just a string with random symbols, you can use any string you want
module.exports = {
    options: {
        getSecret: () => "Secret",
        cookieName: "csrf",
        getTokenFromRequest: (req) => {
            if (req.body.csrfToken) {
                return req.body.csrfToken; // Name of your input from the view (look explanation below)
            }
            return req["x-csrf-token"];
        },
    },
};
