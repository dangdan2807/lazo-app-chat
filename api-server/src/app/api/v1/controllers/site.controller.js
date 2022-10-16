const RoleModel = require('../models/role.model');

class SiteController {
    // [GET] /
    home = (req, res, next) => {
        res.send("connected to db");
    }
    
    // [GET] /docs
    docs = (req, res) => {
        res.render('pages/site/docs', {
            title: 'Tài liệu API',
        });
    }

    // [Get] /insert-db
    insertDb = async (req, res) => {
        // const role = new RoleModel({ name: 'admin' });
        // await role.save();
        // const role2 = new RoleModel({ name: 'user' });
        // await role2.save();
        res.send('user are not allowed to access this page');
    }
}

module.exports = new SiteController();