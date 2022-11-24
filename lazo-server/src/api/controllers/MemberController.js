const memberService = require('../services/MemberService');

class MemberController {
    constructor(io) {
        this.io = io;
        this.leaveGroup = this.leaveGroup.bind(this);
        this.addMember = this.addMember.bind(this);
        this.deleteMember = this.deleteMember.bind(this);
        this.joinConversationFromLink =
            this.joinConversationFromLink.bind(this);
    }

    // [GET] /conversations/:id/members
    getList = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const users = await memberService.getList(id, _id);

            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /conversations/:id/members/leave
    leaveGroup = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const message = await memberService.leaveGroup(id, _id);

            this.io.to(id).emit('new-message', id, message);
            this.io.to(id).emit('update-member', id);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [POST] /conversations/:id/members
    addMember = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;
        const { userIds } = req.body;

        try {
            const message = await memberService.addMembers(
                id,
                _id,
                userIds.filter((userIdEle) => userIdEle != _id),
            );

            this.io.to(id).emit('new-message', id, message);
            userIds.forEach((userIdEle) =>
                this.io.to(userIdEle).emit('added-group', id),
            );
            this.io.to(id).emit('update-member', id);

            res.status(201).json({
                status: 201,
                message: 'Added members successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /conversations/:id/members/:userId
    deleteMember = async (req, res, next) => {
        const { _id } = req;
        const { id, userId } = req.params;

        try {
            const message = await memberService.deleteMember(id, _id, userId);

            this.io.to(id).emit('new-message', id, message);
            this.io.to(userId).emit('deleted-group', id);
            this.io.to(id).emit('update-member', id);
            
            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [POST] /conversations/:id/members/join-from-link
    joinConversationFromLink = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const message = await memberService.joinConversationFromLink(
                id,
                _id,
            );

            this.io.to(id + '').emit('new-message', id, message);
            this.io.to(_id + '').emit('added-group', id);
            this.io.to(id).emit('update-member', id);

            res.status(200).json(message);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = MemberController;
