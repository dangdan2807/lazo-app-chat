const memberService = require('../services/MemberService');
class MemberController {
    constructor(io) {
        this.io = io;
        this.addMember = this.addMember.bind(this);
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

    addMember = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;
        const { userIds } = req.body;

        try {
            const message = await memberService.addMembers(
                id,
                _id,
                userIds.filter((userIdEle) => userIdEle != _id)
            );

            this.io.to(id).emit('new-message', id, message);
            userIds.forEach((userIdEle) =>
                this.io.to(userIdEle).emit('added-group', id)
            );
            this.io.to(id).emit('update-member', id);

            res.status(201).json({
                success: true,
                message: 'Added members successfully',
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MemberController;
