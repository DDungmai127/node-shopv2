const { doubleCsrf } = require("csrf-csrf");
const { options } = require("../configs/csrf-csrfOptions");

const { generateToken } = doubleCsrf(options);

module.exports = {
    createToken: (res) => {
        // I set the token in local of request, because I need to set it in handlebars views by @root.csrf:
        res.locals.csrf = generateToken(res);
        // If you are going to use Max's method to pass value and set it in ejs, you can delete previous line and only return generateToken(res);
    },
};
