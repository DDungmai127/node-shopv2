const { expect } = require("chai");
const authMiddleware = require("../middleware/is-auth");

it("Shound throw an error if no authorization header is present", function () {
    const req = {
        get: function (headerName) {
            return null;
        },
    };
    // expect(authMiddleware(req, {}, () => {})).to.throw("Bot authenticated");
    // expect(() => authMiddleware(req, {}, () => {})).to.throw("Not authenticated")
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not authenticated");
});
