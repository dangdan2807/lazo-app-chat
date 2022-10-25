const memberService = require('../services/MemberService');
class MemberController {
    constructor(io) {
        this.io = io;
    }

    getList = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const users = await memberService.getList(id, _id);

            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MemberController;
